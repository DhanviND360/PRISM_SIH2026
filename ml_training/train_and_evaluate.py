"""
PRISM -- PAIMANA Infrastructure Project Risk Prediction
Full ML Training, Evaluation, and Results Pipeline
======================================================

Dataset : paimana_real_sample.csv  (20 real PAIMANA-monitored projects)
Task 1  : Cost Overrun Classification  (Binary) + Magnitude Regression (Rs Cr)
Task 2  : Schedule Delay Classification (Binary) + Magnitude Regression (months)

Models:
  BASELINES   - EVM CPI/SPI statistical rule, Majority-class
  CLASSIFIERS - Logistic Regression (L2), Random Forest, Gradient Boosting, SVM (RBF)
  REGRESSORS  - Ridge Regression (L2), Random Forest, Gradient Boosting

Evaluation: Leave-One-Out CV (LOOCV), n=20
Metrics:    Accuracy, Precision, Recall, F1, ROC-AUC, MAE, RMSE, R2
"""

import pandas as pd
import numpy as np
import warnings
import os
import json
from datetime import datetime

from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.ensemble import (RandomForestClassifier, GradientBoostingClassifier,
                               RandomForestRegressor, GradientBoostingRegressor)
from sklearn.svm import SVC
from sklearn.model_selection import LeaveOneOut
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (accuracy_score, precision_score, recall_score, f1_score,
                              confusion_matrix, roc_auc_score,
                              mean_absolute_error, mean_squared_error, r2_score)
from sklearn.pipeline import Pipeline
from sklearn.base import clone
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import seaborn as sns

warnings.filterwarnings('ignore')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH   = os.path.join(SCRIPT_DIR, '..', 'paimana_real_sample.csv')
OUT_DIR    = SCRIPT_DIR

# ============================================================
# 1. LOAD & PARSE
# ============================================================

def load_paimana(path):
    df = pd.read_csv(path)
    df.columns = df.columns.str.strip()
    df['latest_revised_completion_date'] = pd.to_datetime(
        df['latest_revised_completion_date'], format='%d/%m/%Y')
    for col in ['original_cost_cr', 'latest_revised_cost_cr', 'physical_progress_pct']:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    df = df.dropna(subset=['original_cost_cr','latest_revised_cost_cr','physical_progress_pct'])
    return df

# ============================================================
# 2. FEATURE ENGINEERING  (mirrors TypeScript preprocessing.ts)
# ============================================================

SECTOR_RISK = {
    "Telecommunication":0.85,"Energy Storage":0.80,"Steel":0.70,"Metals & Mining":0.65,
    "Railways":0.50,"Roads & Highways":0.45,"Urban Public Transport":0.40,"Oil & Gas":0.35,
    "Electricity Generation":0.30,"Coal":0.25,"Water Resources":0.25,"Waste & Water":0.20,
    "Education":0.15,"Healthcare":0.15,"Real Estate":0.35,"Shipping":0.60,
    "Inland Waterways":0.20,"Logistics Infrastructure":0.20,
    "Aviation & Aviation Infrastructure":0.25,"Transmission & Distribution":0.25,
}

def engineer(df, now=None):
    now = now or datetime.now()
    r = df.copy()
    r['months_to_target'] = (r['latest_revised_completion_date'] - now).dt.total_seconds() / (86400*30.44)
    r['log_cost']         = np.log10(r['original_cost_cr'].clip(lower=1))
    r['progress_norm']    = r['physical_progress_pct'] / 100.0
    r['elapsed_months']   = (36 - r['months_to_target'].clip(upper=36)).clip(lower=2)
    r['velocity']         = (r['progress_norm'] / (r['elapsed_months']/12)).clip(lower=0)
    r['sector_risk']      = r['sector'].map(SECTOR_RISK).fillna(0.35)

    # Targets
    r['has_cost_overrun']  = (r['latest_revised_cost_cr'] > r['original_cost_cr']).astype(int)
    r['cost_overrun_cr']   = (r['latest_revised_cost_cr'] - r['original_cost_cr']).clip(lower=0)
    r['cost_overrun_pct']  = (r['cost_overrun_cr'] / r['original_cost_cr'] * 100).round(2)

    r['is_past_target']   = ((r['latest_revised_completion_date'] < pd.Timestamp(now)) &
                              (r['physical_progress_pct'] < 100)).astype(int)
    r['months_overdue']   = r.apply(lambda x: max(0,-x['months_to_target']) if x['is_past_target'] else 0, axis=1)
    r['velocity_lag']     = ((r['months_to_target']>0)&(r['months_to_target']<12)&(r['physical_progress_pct']<60)).astype(int)
    r['has_sched_delay']  = ((r['is_past_target']|r['velocity_lag'])>0).astype(int)
    r['delay_months']     = r.apply(
        lambda x: round(x['months_overdue']) if x['is_past_target']
        else (round((100-x['physical_progress_pct'])*0.25) if x['velocity_lag'] else 0), axis=1)
    return r

FEATS = ['log_cost','progress_norm','months_to_target','velocity','sector_risk']
FEAT_LABELS = {
    'log_cost':'Project Scale (log10 Rs Cr)',
    'progress_norm':'Physical Progress (0-1)',
    'months_to_target':'Months to Target',
    'velocity':'Execution Velocity',
    'sector_risk':'Sector Risk Weight',
}

# ============================================================
# 3. EVM BASELINE
# ============================================================

def evm_baseline(df):
    rows = []
    for _, row in df.iterrows():
        orig, rev, prog = row['original_cost_cr'], row['latest_revised_cost_cr'], row['physical_progress_pct']
        mtt = row['months_to_target']
        elapsed = max(1, 36-max(0,mtt))
        planned_pct = min(100, max(5, elapsed/36*100))
        pv = planned_pct/100*orig; ev = prog/100*orig; ac = rev
        cpi = max(0.1, min(2.0, ev/ac)) if ac>0 else 1.0
        spi = max(0.1, min(2.0, ev/pv)) if pv>0 else 1.0
        eac = orig/cpi; proj_co = max(0, eac-orig)
        proj_delay = 0
        if spi < 0.95:
            vel = max(0.2, prog/elapsed)
            proj_delay = max(0, round((max(0,100-prog)/vel) - max(0,mtt)))
        elif mtt < 0 and prog < 100:
            proj_delay = round(abs(mtt))
        rows.append({
            'cpi':round(cpi,3),'spi':round(spi,3),'eac':round(eac,1),
            'evm_co_cr':round(proj_co,1),'evm_delay_mo':proj_delay,
            'evm_cost_flag':int(cpi<0.92 or proj_co>0),
            'evm_sched_flag':int(spi<0.90 or proj_delay>0),
        })
    return pd.DataFrame(rows, index=df.index)

# ============================================================
# 4. LOOCV HELPERS
# ============================================================

def loocv_clf(X, y, pipe):
    loo = LeaveOneOut()
    yt, yp, ypr = [],[],[]
    for tr, te in loo.split(X):
        m = clone(pipe)
        m.fit(X[tr], y[tr])
        yp.append(int(m.predict(X[te])[0]))
        try:    ypr.append(float(m.predict_proba(X[te])[0][1]))
        except: ypr.append(float(yp[-1]))
        yt.append(int(y[te[0]]))
    yt,yp,ypr = np.array(yt),np.array(yp),np.array(ypr)
    cm = confusion_matrix(yt,yp)
    try:    auc = round(float(roc_auc_score(yt,ypr)),4)
    except: auc = None
    return dict(
        accuracy=round(float(accuracy_score(yt,yp)),4),
        precision=round(float(precision_score(yt,yp,zero_division=0)),4),
        recall=round(float(recall_score(yt,yp,zero_division=0)),4),
        f1_score=round(float(f1_score(yt,yp,zero_division=0)),4),
        roc_auc=auc, confusion_matrix=cm.tolist(),
        y_true=yt.tolist(), y_pred=yp.tolist(),
        y_prob=[round(float(p),4) for p in ypr],
    )

def loocv_reg(X, y, pipe):
    loo = LeaveOneOut()
    yt,yp = [],[]
    for tr,te in loo.split(X):
        m = clone(pipe); m.fit(X[tr],y[tr])
        yt.append(float(y[te[0]]))
        yp.append(max(0.0, float(m.predict(X[te])[0])))
    yt,yp = np.array(yt),np.array(yp)
    return dict(
        mae=round(float(mean_absolute_error(yt,yp)),2),
        rmse=round(float(np.sqrt(mean_squared_error(yt,yp))),2),
        r2=round(float(r2_score(yt,yp)),4),
        y_true=yt.tolist(), y_pred=[round(float(p),2) for p in yp],
    )

# ============================================================
# 5. PIPELINES
# ============================================================

CLFS = {
    'Logistic Regression (L2)': Pipeline([('s',StandardScaler()),('c',LogisticRegression(C=1.0,max_iter=1000,random_state=42))]),
    'Random Forest':             Pipeline([('s',StandardScaler()),('c',RandomForestClassifier(n_estimators=100,max_depth=3,random_state=42))]),
    'Gradient Boosting':         Pipeline([('s',StandardScaler()),('c',GradientBoostingClassifier(n_estimators=50,max_depth=2,learning_rate=0.1,random_state=42))]),
    'SVM (RBF)':                 Pipeline([('s',StandardScaler()),('c',SVC(kernel='rbf',C=1.0,probability=True,random_state=42))]),
}
REGS = {
    'Ridge Regression (L2)':     Pipeline([('s',StandardScaler()),('r',Ridge(alpha=1.0))]),
    'Random Forest Regressor':   Pipeline([('s',StandardScaler()),('r',RandomForestRegressor(n_estimators=100,max_depth=3,random_state=42))]),
    'Gradient Boosting Regressor':Pipeline([('s',StandardScaler()),('r',GradientBoostingRegressor(n_estimators=50,max_depth=2,learning_rate=0.1,random_state=42))]),
}

# ============================================================
# 6. MAIN
# ============================================================

def run():
    print("="*70)
    print("PRISM  --  PAIMANA Project Risk Prediction: Full ML Experiment")
    print("="*70)

    df_raw = load_paimana(CSV_PATH)
    df = engineer(df_raw)
    evm = evm_baseline(df)
    df = pd.concat([df,evm],axis=1)

    n = len(df)
    print(f"\nDataset: {n} PAIMANA infrastructure projects")
    print(f"  Cost overruns detected    : {df['has_cost_overrun'].sum()} / {n}")
    print(f"  Schedule delays detected  : {df['has_sched_delay'].sum()} / {n}")
    print(f"\nFeatures used (leakage-safe):")
    for f in FEATS: print(f"  - {FEAT_LABELS[f]}")

    X = df[FEATS].values.astype(float)
    yc = df['has_cost_overrun'].values.astype(int)
    yca = df['cost_overrun_cr'].values.astype(float)
    ys = df['has_sched_delay'].values.astype(int)
    ysa = df['delay_months'].values.astype(float)

    res = {
        'generated_at': datetime.now().isoformat(),
        'dataset_n': n,
        'cost_overrun_positives': int(yc.sum()),
        'sched_delay_positives': int(ys.sum()),
        'features': FEATS,
        'projects': df[['project_name','sector','original_cost_cr','physical_progress_pct',
                         'has_cost_overrun','cost_overrun_cr','cost_overrun_pct',
                         'has_sched_delay','delay_months']].to_dict(orient='records'),
        'evm_baseline': {},
        'cost_clf': {}, 'sched_clf': {},
        'cost_reg': {}, 'sched_reg': {},
    }

    # EVM metrics
    evm_ca = accuracy_score(yc, evm['evm_cost_flag'])
    evm_cf1= f1_score(yc, evm['evm_cost_flag'], zero_division=0)
    evm_cp = precision_score(yc, evm['evm_cost_flag'], zero_division=0)
    evm_cr2= recall_score(yc, evm['evm_cost_flag'], zero_division=0)
    evm_cm = mean_absolute_error(yca, evm['evm_co_cr'])
    evm_sa = accuracy_score(ys, evm['evm_sched_flag'])
    evm_sf1= f1_score(ys, evm['evm_sched_flag'], zero_division=0)
    evm_sp = precision_score(ys, evm['evm_sched_flag'], zero_division=0)
    evm_sr2= recall_score(ys, evm['evm_sched_flag'], zero_division=0)
    evm_sm = mean_absolute_error(ysa, evm['evm_delay_mo'])

    res['evm_baseline'] = {
        'cost':{'accuracy':round(evm_ca,4),'precision':round(evm_cp,4),'recall':round(evm_cr2,4),'f1_score':round(evm_cf1,4),'mae':round(evm_cm,2)},
        'sched':{'accuracy':round(evm_sa,4),'precision':round(evm_sp,4),'recall':round(evm_sr2,4),'f1_score':round(evm_sf1,4),'mae':round(evm_sm,2)},
    }
    print(f"\nEVM Statistical Baseline (no ML):")
    print(f"  Cost Overrun   -- Acc:{evm_ca:.1%}  F1:{evm_cf1:.3f}  MAE:Rs{evm_cm:,.0f} Cr")
    print(f"  Schedule Delay -- Acc:{evm_sa:.1%}  F1:{evm_sf1:.3f}  MAE:{evm_sm:.1f} months")

    # Cost classification LOOCV
    print("\nLOOCV Classification -- Cost Overrun:")
    print(f"  {'Model':<28} {'Acc':>6} {'Prec':>6} {'Rec':>6} {'F1':>6} {'AUC':>7}")
    print(f"  {'-'*60}")
    for nm, pipe in CLFS.items():
        r2 = loocv_clf(X,yc,pipe)
        res['cost_clf'][nm]=r2
        astr = f"{r2['roc_auc']:.4f}" if r2['roc_auc'] else "  N/A"
        print(f"  {nm:<28} {r2['accuracy']:.4f} {r2['precision']:.4f} {r2['recall']:.4f} {r2['f1_score']:.4f} {astr}")

    # Schedule classification LOOCV
    print("\nLOOCV Classification -- Schedule Delay:")
    print(f"  {'Model':<28} {'Acc':>6} {'Prec':>6} {'Rec':>6} {'F1':>6} {'AUC':>7}")
    print(f"  {'-'*60}")
    for nm, pipe in CLFS.items():
        r2 = loocv_clf(X,ys,pipe)
        res['sched_clf'][nm]=r2
        astr = f"{r2['roc_auc']:.4f}" if r2['roc_auc'] else "  N/A"
        print(f"  {nm:<28} {r2['accuracy']:.4f} {r2['precision']:.4f} {r2['recall']:.4f} {r2['f1_score']:.4f} {astr}")

    # Cost regression LOOCV
    print("\nLOOCV Regression -- Cost Escalation (Rs Cr):")
    print(f"  {'Model':<30} {'MAE':>12} {'RMSE':>12} {'R2':>7}")
    print(f"  {'-'*61}")
    for nm, pipe in REGS.items():
        r2 = loocv_reg(X,yca,pipe)
        res['cost_reg'][nm]=r2
        print(f"  {nm:<30} {r2['mae']:>12,.1f} {r2['rmse']:>12,.1f} {r2['r2']:>7.4f}")
    evm_cr = {'mae':round(evm_cm,2),'rmse':round(float(np.sqrt(mean_squared_error(yca,evm['evm_co_cr']))),2),'r2':round(float(r2_score(yca,evm['evm_co_cr'])),4)}
    res['cost_reg']['EVM Baseline']=evm_cr
    print(f"  {'EVM Baseline (CPI/EAC)':<30} {evm_cm:>12,.1f} {evm_cr['rmse']:>12,.1f} {evm_cr['r2']:>7.4f}")

    # Schedule regression LOOCV
    print("\nLOOCV Regression -- Schedule Delay (Months):")
    print(f"  {'Model':<30} {'MAE':>10} {'RMSE':>10} {'R2':>7}")
    print(f"  {'-'*57}")
    for nm, pipe in REGS.items():
        r2 = loocv_reg(X,ysa,pipe)
        res['sched_reg'][nm]=r2
        print(f"  {nm:<30} {r2['mae']:>10.2f} {r2['rmse']:>10.2f} {r2['r2']:>7.4f}")
    evm_sr = {'mae':round(evm_sm,2),'rmse':round(float(np.sqrt(mean_squared_error(ysa,evm['evm_delay_mo']))),2),'r2':round(float(r2_score(ysa,evm['evm_delay_mo'])),4)}
    res['sched_reg']['EVM Baseline']=evm_sr
    print(f"  {'EVM Baseline (SPI/Linear)':<30} {evm_sm:>10.2f} {evm_sr['rmse']:>10.2f} {evm_sr['r2']:>7.4f}")

    # Feature importances on full data
    rf_c = clone(CLFS['Random Forest']); rf_c.fit(X,yc)
    rf_s = clone(CLFS['Random Forest']); rf_s.fit(X,ys)
    res['feature_importances']={
        'cost': {f:round(float(v),4) for f,v in zip(FEATS, rf_c.named_steps['c'].feature_importances_)},
        'sched':{f:round(float(v),4) for f,v in zip(FEATS, rf_s.named_steps['c'].feature_importances_)},
    }

    # Save JSON
    jpath = os.path.join(OUT_DIR,'ml_results.json')
    with open(jpath,'w',encoding='utf-8') as f: json.dump(res,f,indent=2,default=str)
    print(f"\nResults JSON saved: {jpath}")
    return df, res, evm

# ============================================================
# 7. VISUALIZE
# ============================================================

def viz(df, res, evm):
    print("\nGenerating visualizations...")
    PAL={'p':'#6366f1','s':'#f59e0b','g':'#10b981','r':'#ef4444',
         'txt':'#f1f5f9','bg':'#0f172a','card':'#1e293b','grid':'#334155'}
    plt.rcParams.update({'figure.facecolor':PAL['bg'],'axes.facecolor':PAL['card'],
        'axes.edgecolor':PAL['grid'],'axes.labelcolor':PAL['txt'],
        'text.color':PAL['txt'],'xtick.color':PAL['txt'],'ytick.color':PAL['txt'],
        'grid.color':PAL['grid'],'grid.alpha':0.4,'font.size':10})

    cc = res['cost_clf']; sc = res['sched_clf']
    cr = res['cost_reg']; sr = res['sched_reg']
    evm_b = res['evm_baseline']
    best_cc = max(cc, key=lambda k: cc[k]['f1_score'])
    best_sc = max(sc, key=lambda k: sc[k]['f1_score'])
    best_cr = min({k:v for k,v in cr.items() if k!='EVM Baseline'}, key=lambda k: cr[k]['mae'])
    best_sr = min({k:v for k,v in sr.items() if k!='EVM Baseline'}, key=lambda k: sr[k]['mae'])

    # ─── Figure 1: Benchmark Overview ───────────────────────────────────────
    fig = plt.figure(figsize=(20,26)); fig.patch.set_facecolor(PAL['bg'])
    gs = gridspec.GridSpec(4,3,figure=fig,hspace=0.48,wspace=0.36)

    fig.text(0.5,0.97,'PRISM -- PAIMANA Infrastructure Risk Prediction: ML Evaluation Report',
             ha='center',fontsize=15,fontweight='bold',color=PAL['txt'])
    fig.text(0.5,0.955,f"Dataset: {res['dataset_n']} real PAIMANA projects  |  Evaluation: Leave-One-Out Cross-Validation (LOOCV)  |  {res['generated_at'][:19]}",
             ha='center',fontsize=9.5,color='#94a3b8')

    models_all = ['EVM\nBaseline'] + [m.replace(' ','\n') for m in cc.keys()]
    acc_cost  = [evm_b['cost']['accuracy']]  + [cc[k]['accuracy']  for k in cc]
    f1_cost   = [evm_b['cost']['f1_score']]  + [cc[k]['f1_score']  for k in cc]
    acc_sched = [evm_b['sched']['accuracy']] + [sc[k]['accuracy']  for k in sc]
    f1_sched  = [evm_b['sched']['f1_score']] + [sc[k]['f1_score']  for k in sc]
    x=np.arange(len(models_all)); w=0.32
    cols_all = [PAL['s']]+[PAL['p']]*len(cc)
    cols_f1  = [PAL['r']]+[PAL['g']]*len(cc)

    ax=fig.add_subplot(gs[0,0])
    b1=ax.bar(x-w/2,acc_cost,w,label='Accuracy',color=cols_all,alpha=0.85)
    b2=ax.bar(x+w/2,f1_cost,w,label='F1 Score',color=cols_f1,alpha=0.85)
    ax.set_title('Cost Overrun Classification\n(LOOCV)',fontweight='bold')
    ax.set_xticks(x); ax.set_xticklabels(models_all,fontsize=7.5)
    ax.set_ylim(0,1.15); ax.legend(fontsize=8); ax.grid(axis='y',alpha=0.3)
    [ax.text(b.get_x()+b.get_width()/2,b.get_height()+0.02,f'{v:.0%}',ha='center',fontsize=7,fontweight='bold') for b,v in zip(b1,acc_cost)]

    ax=fig.add_subplot(gs[0,1])
    b1=ax.bar(x-w/2,acc_sched,w,label='Accuracy',color=cols_all,alpha=0.85)
    b2=ax.bar(x+w/2,f1_sched,w,label='F1 Score',color=cols_f1,alpha=0.85)
    ax.set_title('Schedule Delay Classification\n(LOOCV)',fontweight='bold')
    ax.set_xticks(x); ax.set_xticklabels(models_all,fontsize=7.5)
    ax.set_ylim(0,1.15); ax.legend(fontsize=8); ax.grid(axis='y',alpha=0.3)
    [ax.text(b.get_x()+b.get_width()/2,b.get_height()+0.02,f'{v:.0%}',ha='center',fontsize=7,fontweight='bold') for b,v in zip(b1,acc_sched)]

    ax=fig.add_subplot(gs[0,2])
    model_names=list(cc.keys()); x3=np.arange(len(model_names))
    auc_c=[cc[k]['roc_auc'] or 0 for k in model_names]
    auc_s=[sc[k]['roc_auc'] or 0 for k in model_names]
    ax.bar(x3-w/2,auc_c,w,label='Cost Overrun',color=PAL['p'],alpha=0.85)
    ax.bar(x3+w/2,auc_s,w,label='Schedule Delay',color=PAL['g'],alpha=0.85)
    ax.axhline(0.5,color=PAL['s'],linestyle='--',lw=1,label='Random (0.5)')
    ax.set_title('ROC-AUC Score\n(LOOCV)',fontweight='bold')
    ax.set_xticks(x3); ax.set_xticklabels([m.replace(' ','\n') for m in model_names],fontsize=7.5)
    ax.set_ylim(0,1.1); ax.legend(fontsize=8); ax.grid(axis='y',alpha=0.3)
    for xi,(ac,as_) in enumerate(zip(auc_c,auc_s)):
        ax.text(xi-w/2,ac+0.02,f'{ac:.2f}',ha='center',fontsize=7.5,fontweight='bold')
        ax.text(xi+w/2,as_+0.02,f'{as_:.2f}',ha='center',fontsize=7.5,fontweight='bold')

    # Confusion matrices
    ax=fig.add_subplot(gs[1,0])
    cm=np.array(cc[best_cc]['confusion_matrix'])
    if cm.shape==(2,2):
        sns.heatmap(cm,annot=True,fmt='d',cmap='Blues',ax=ax,
                    xticklabels=['No Overrun','Overrun'],yticklabels=['No Overrun','Overrun'],
                    linewidths=0.5,linecolor=PAL['grid'],cbar=False,annot_kws={'size':13,'weight':'bold'})
    ax.set_title(f'Confusion Matrix -- Cost Overrun\n({best_cc})',fontweight='bold')
    ax.set_xlabel('Predicted'); ax.set_ylabel('Actual')

    ax=fig.add_subplot(gs[1,1])
    cm=np.array(sc[best_sc]['confusion_matrix'])
    if cm.shape==(2,2):
        sns.heatmap(cm,annot=True,fmt='d',cmap='Greens',ax=ax,
                    xticklabels=['On Time','Delayed'],yticklabels=['On Time','Delayed'],
                    linewidths=0.5,linecolor=PAL['grid'],cbar=False,annot_kws={'size':13,'weight':'bold'})
    ax.set_title(f'Confusion Matrix -- Schedule Delay\n({best_sc})',fontweight='bold')
    ax.set_xlabel('Predicted'); ax.set_ylabel('Actual')

    ax=fig.add_subplot(gs[1,2])
    mets=['Accuracy','Precision','Recall','F1']
    ml_v=[cc[best_cc][k] for k in ['accuracy','precision','recall','f1_score']]
    ev_v=[evm_b['cost'][k] for k in ['accuracy','precision','recall','f1_score']]
    xi=np.arange(4)
    ax.bar(xi-w/2,ml_v,w,label=f'ML ({best_cc})',color=PAL['p'],alpha=0.85)
    ax.bar(xi+w/2,ev_v,w,label='EVM Statistical',color=PAL['s'],alpha=0.85)
    [ax.text(i-w/2,v+0.02,f'{v:.2f}',ha='center',fontsize=7.5,fontweight='bold',color=PAL['p']) for i,v in enumerate(ml_v)]
    [ax.text(i+w/2,v+0.02,f'{v:.2f}',ha='center',fontsize=7.5,fontweight='bold',color=PAL['s']) for i,v in enumerate(ev_v)]
    ax.set_title('ML vs EVM -- Cost Overrun\nAll Classification Metrics',fontweight='bold')
    ax.set_xticks(xi); ax.set_xticklabels(mets); ax.set_ylim(0,1.15)
    ax.legend(fontsize=8); ax.grid(axis='y',alpha=0.3)

    # Regression MAEs
    ax=fig.add_subplot(gs[2,0])
    rnames=list(cr.keys()); rmaes=[cr[k]['mae'] for k in rnames]
    rcols=[PAL['s'] if 'EVM' in k else PAL['p'] for k in rnames]
    bars=ax.barh(rnames,rmaes,color=rcols,alpha=0.85)
    ax.set_title('Cost Escalation MAE (Rs Cr)\nLower = Better',fontweight='bold')
    ax.set_xlabel('MAE (Rs Crore)')
    [ax.text(b.get_width()+max(rmaes)*0.01,b.get_y()+b.get_height()/2,f'Rs{v:,.0f}',va='center',fontsize=8.5,fontweight='bold') for b,v in zip(bars,rmaes)]
    ax.set_xlim(0,max(rmaes)*1.3); ax.grid(axis='x',alpha=0.3)

    ax=fig.add_subplot(gs[2,1])
    srnames=list(sr.keys()); srmaes=[sr[k]['mae'] for k in srnames]
    srcols=[PAL['s'] if 'EVM' in k else PAL['g'] for k in srnames]
    bars=ax.barh(srnames,srmaes,color=srcols,alpha=0.85)
    ax.set_title('Schedule Delay MAE (Months)\nLower = Better',fontweight='bold')
    ax.set_xlabel('MAE (Months)')
    [ax.text(b.get_width()+max(srmaes)*0.01,b.get_y()+b.get_height()/2,f'{v:.2f} mo',va='center',fontsize=8.5,fontweight='bold') for b,v in zip(bars,srmaes)]
    ax.set_xlim(0,max(srmaes)*1.3); ax.grid(axis='x',alpha=0.3)

    ax=fig.add_subplot(gs[2,2])
    fi=res['feature_importances']['cost']
    fl=[FEAT_LABELS[k] for k in fi]; fv=list(fi.values())
    si=np.argsort(fv)
    ax.barh([fl[i] for i in si],[fv[i] for i in si],color=PAL['p'],alpha=0.85)
    ax.set_title('Feature Importance -- Cost Overrun\n(Random Forest, Full Train)',fontweight='bold')
    ax.set_xlabel('Importance Score'); ax.grid(axis='x',alpha=0.3)

    # Per-project table
    ax=fig.add_subplot(gs[3,:]); ax.axis('off')
    cp=cc[best_cc]['y_prob']; cpred=cc[best_cc]['y_pred']
    sp=sc[best_sc]['y_prob']; spred=sc[best_sc]['y_pred']
    tdata=[]; projs=res['projects']
    for i,p in enumerate(projs):
        nm=p['project_name'][:34]+'...' if len(p['project_name'])>34 else p['project_name']
        tdata.append([nm,p['sector'][:18],f"Rs{p['original_cost_cr']:,.0f}",f"{p['physical_progress_pct']}%",
            'YES' if p['has_cost_overrun'] else 'NO',f"{cp[i]:.2f}",
            'YES' if cpred[i]==1 else 'NO','OK' if cpred[i]==p['has_cost_overrun'] else 'ERR',
            'YES' if p['has_sched_delay'] else 'NO',f"{sp[i]:.2f}",
            'YES' if spred[i]==1 else 'NO','OK' if spred[i]==p['has_sched_delay'] else 'ERR'])
    cols=['Project','Sector','Cost(Rs Cr)','Prog','Actual\nCost Overrun','P(cost)','Pred\nCost Overrun','Match',
          'Actual\nDelay','P(delay)','Pred\nDelay','Match']
    t=ax.table(cellText=tdata,colLabels=cols,cellLoc='center',loc='center',bbox=[0,0,1,1])
    t.auto_set_font_size(False); t.set_fontsize(6.8)
    for (r,c),cell in t.get_celld().items():
        if r==0: cell.set_facecolor('#1e40af'); cell.set_text_props(color='white',fontweight='bold')
        elif r%2==0: cell.set_facecolor('#1e293b')
        else: cell.set_facecolor('#0f172a')
        cell.set_edgecolor(PAL['grid'])
        if r>0 and c in [7,11]:
            v=tdata[r-1][c]
            cell.set_facecolor('#065f46' if v=='OK' else '#7f1d1d')
            cell.set_text_props(fontweight='bold',color='white')
    ax.set_title(f'Per-Project Predictions (Best: Cost={best_cc} | Sched={best_sc})',fontweight='bold',pad=8,loc='left')

    plt.savefig(os.path.join(OUT_DIR,'ml_evaluation_report.png'),dpi=150,bbox_inches='tight',facecolor=PAL['bg'])
    print("  Saved: ml_evaluation_report.png")
    plt.close('all')

    # ─── Figure 2: Actual vs Predicted Scatter ─────────────────────────────
    fig2,axes=plt.subplots(1,2,figsize=(14,6)); fig2.patch.set_facecolor(PAL['bg'])
    fig2.suptitle('PRISM -- Actual vs. Predicted (LOOCV Regression)',fontsize=13,fontweight='bold',color=PAL['txt'])
    for ax,(ytk,ypk,title,col,unit) in zip(axes,[
        (cr[best_cr]['y_true'],cr[best_cr]['y_pred'],f'Cost Escalation\n({best_cr})\nMAE=Rs{cr[best_cr]["mae"]:,.0f} Cr  R2={cr[best_cr]["r2"]:.3f}',PAL['p'],'Rs Cr'),
        (sr[best_sr]['y_true'],sr[best_sr]['y_pred'],f'Schedule Delay\n({best_sr})\nMAE={sr[best_sr]["mae"]:.2f} mo  R2={sr[best_sr]["r2"]:.3f}',PAL['g'],'Months'),
    ]):
        yt,yp=np.array(ytk),np.array(ypk)
        ax.set_facecolor(PAL['card'])
        ax.scatter(yt,yp,c=col,s=80,alpha=0.85,edgecolors='white',lw=0.5,zorder=3)
        mx=max(yt.max(),yp.max())*1.08 if max(yt.max(),yp.max())>0 else 10
        ax.plot([0,mx],[0,mx],'r--',lw=1.5,alpha=0.7,label='Perfect')
        ax.set_xlabel(f'Actual ({unit})',color=PAL['txt']); ax.set_ylabel(f'Predicted ({unit})',color=PAL['txt'])
        ax.set_title(title,color=PAL['txt'],fontweight='bold')
        ax.legend(fontsize=9); ax.grid(True,alpha=0.3,color=PAL['grid'])
        for i,(xt,xp) in enumerate(zip(yt,yp)):
            if abs(xt-xp)>5000 or xt>40000:
                ax.annotate(res['projects'][i]['project_name'][:18],(xt,xp),
                            textcoords='offset points',xytext=(5,5),fontsize=5.5,color='#94a3b8')
    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR,'actual_vs_predicted.png'),dpi=150,bbox_inches='tight',facecolor=PAL['bg'])
    print("  Saved: actual_vs_predicted.png")
    plt.close('all')

# ============================================================
# 8. PRINT SUMMARY
# ============================================================

def summary(res):
    print("\n"+"="*70)
    print("  FINAL BENCHMARK SUMMARY -- ML vs EVM Statistical Baseline")
    print("="*70)
    evm=res['evm_baseline']; cc=res['cost_clf']; sc=res['sched_clf']
    cr=res['cost_reg']; sr=res['sched_reg']
    bc=max(cc,key=lambda k:cc[k]['f1_score'])
    bs=max(sc,key=lambda k:sc[k]['f1_score'])
    bcr=min({k:v for k,v in cr.items() if k!='EVM Baseline'},key=lambda k:cr[k]['mae'])
    bsr=min({k:v for k,v in sr.items() if k!='EVM Baseline'},key=lambda k:sr[k]['mae'])
    hdr=f"\n  {'Method':<32} {'Acc':>7} {'Prec':>7} {'Recall':>8} {'F1':>7} {'AUC':>7}"
    sep="  "+"-"*70

    print("\n  COST OVERRUN CLASSIFICATION (LOOCV)"+hdr+"\n"+sep)
    print(f"  {'EVM Statistical (CPI/SPI)':<32} {evm['cost']['accuracy']:>7.1%} {evm['cost']['precision']:>7.1%} {evm['cost']['recall']:>8.1%} {evm['cost']['f1_score']:>7.3f} {'N/A':>7}")
    for nm,r in cc.items():
        mk=' <- BEST ML' if nm==bc else ''
        a=f"{r['roc_auc']:.3f}" if r['roc_auc'] else 'N/A'
        print(f"  {nm:<32} {r['accuracy']:>7.1%} {r['precision']:>7.1%} {r['recall']:>8.1%} {r['f1_score']:>7.3f} {a:>7}{mk}")

    print("\n  SCHEDULE DELAY CLASSIFICATION (LOOCV)"+hdr+"\n"+sep)
    print(f"  {'EVM Statistical (SPI)':<32} {evm['sched']['accuracy']:>7.1%} {evm['sched']['precision']:>7.1%} {evm['sched']['recall']:>8.1%} {evm['sched']['f1_score']:>7.3f} {'N/A':>7}")
    for nm,r in sc.items():
        mk=' <- BEST ML' if nm==bs else ''
        a=f"{r['roc_auc']:.3f}" if r['roc_auc'] else 'N/A'
        print(f"  {nm:<32} {r['accuracy']:>7.1%} {r['precision']:>7.1%} {r['recall']:>8.1%} {r['f1_score']:>7.3f} {a:>7}{mk}")

    print(f"\n  COST ESCALATION REGRESSION (LOOCV)")
    print(f"  {'Method':<32} {'MAE (Rs Cr)':>13} {'RMSE':>12} {'R2':>8}\n"+sep)
    for nm,r in cr.items():
        mk=' <- BEST ML' if nm==bcr else ''
        print(f"  {nm:<32} {r['mae']:>13,.0f} {r['rmse']:>12,.0f} {r['r2']:>8.4f}{mk}")

    print(f"\n  SCHEDULE SLIPPAGE REGRESSION (LOOCV)")
    print(f"  {'Method':<32} {'MAE (Months)':>13} {'RMSE':>12} {'R2':>8}\n"+sep)
    for nm,r in sr.items():
        mk=' <- BEST ML' if nm==bsr else ''
        print(f"  {nm:<32} {r['mae']:>13.2f} {r['rmse']:>12.2f} {r['r2']:>8.4f}{mk}")

    gc=(cc[bc]['accuracy']-evm['cost']['accuracy']); gf=(cc[bc]['f1_score']-evm['cost']['f1_score'])
    gs2=(sc[bs]['accuracy']-evm['sched']['accuracy']); gf2=(sc[bs]['f1_score']-evm['sched']['f1_score'])
    print(f"\n  ML GAINS OVER EVM BASELINE:")
    print(f"     Cost Overrun   -- Acc: {gc:+.1%}   F1: {gf:+.3f}")
    print(f"     Sched Delay    -- Acc: {gs2:+.1%}   F1: {gf2:+.3f}")
    print(f"\n  BEST MODELS:")
    print(f"     Cost Classification  -> {bc}")
    print(f"     Sched Classification -> {bs}")
    print(f"     Cost Regression      -> {bcr}")
    print(f"     Sched Regression     -> {bsr}")
    print()

if __name__=='__main__':
    df,res,evm=run()
    summary(res)
    viz(df,res,evm)
    print("Done. Check ml_training/ for ml_results.json, ml_evaluation_report.png, actual_vs_predicted.png")
