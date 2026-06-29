package com.reactnativeintegration;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

public class CTCacheModule extends ReactContextBaseJavaModule {

    private static final String TAG = "CTCache";
    private static final String WIZROCKET = "WizRocket";
    private static final String CT_ACCOUNT_ID = "TEST-RK4-66R-966Z";
    private static final String CACHED_GUIDS_KEY = "cachedGUIDsKey:" + CT_ACCOUNT_ID;

    public CTCacheModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "CTCache";
    }

    /**
     * Resolves { cached: boolean, raw: string } so JS can log both
     * the decision and the actual stored value.
     */
    @ReactMethod
    public void isIdentityCached(String contractId, Promise promise) {
        try {
            SharedPreferences prefs = getReactApplicationContext()
                    .getSharedPreferences(WIZROCKET, Context.MODE_PRIVATE);

            String raw = prefs.getString(CACHED_GUIDS_KEY, null);

            Log.d(TAG, "key=" + CACHED_GUIDS_KEY);
            Log.d(TAG, "contractId=" + contractId);
            Log.d(TAG, "raw value=" + raw);

            boolean cached = false;
            if (raw != null && !raw.isEmpty()) {
                // Closing quote so "okwreact2" won't false-match "okwreact20".
                cached = raw.contains("\"Identity_" + contractId + "\"");
            }

            Log.d(TAG, "cached=" + cached);

            WritableMap result = Arguments.createMap();
            result.putBoolean("cached", cached);
            result.putString("raw", raw == null ? "" : raw);
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "read error", e);
            promise.reject("CTCACHE_READ_ERROR", e.getMessage(), e);
        }
    }
}
