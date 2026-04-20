import numpy as np

class HybridModel:
    def __init__(self, svm, xgb_mod, scl, w_svm=0.6, w_xgb=0.4, threshold=0.5):
        self.svm = svm
        self.xgb = xgb_mod
        self.scaler = scl
        self.w_s = w_svm
        self.w_x = w_xgb
        self.threshold = threshold
        
    def predict_proba(self, X):
        Xs = self.scaler.transform(X)
        return self.w_s * self.svm.predict_proba(Xs) + self.w_x * self.xgb.predict_proba(X)
        
    def predict(self, X):
        p = self.predict_proba(X)
        return (p[:, 1] >= self.threshold).astype(int)
