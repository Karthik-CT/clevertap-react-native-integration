package com.reactnativeintegration;

import android.content.Context;
import android.content.Intent;
import android.util.Log;
import androidx.annotation.NonNull;
import com.clevertap.android.sdk.ActivityLifecycleCallback;
import com.clevertap.android.sdk.CleverTapAPI;
import com.clevertap.android.sdk.CleverTapInstanceConfig;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Objects;
import java.io.*;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableMap;
import java.util.*;
import com.facebook.react.bridge.*;
import android.content.SharedPreferences;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.os.Build;
import android.widget.Toast;
import androidx.core.content.ContextCompat;
import com.facebook.react.bridge.LifecycleEventListener;
import java.util.Map;

public class CTModule extends ReactContextBaseJavaModule implements LifecycleEventListener  {
    public static Context context;

    CTModule(ReactApplicationContext context) {
        super(context);
        this.context = context;
        context.addLifecycleEventListener(this);
    }

    @ReactMethod
    static CleverTapAPI clevertapAdditionalInstance = null;
    CleverTapInstanceConfig clevertapAdditionalInstanceConfig = null;

    @NonNull
    @Override
    public String getName() {
        return "CTModule";
    }

    @ReactMethod
    void initCleverTap(String country) {
        Log.d("CT", "I am from CTModule initCleverTap Method");
        SharedPreferences sharedPreferences = context.getSharedPreferences("CTPreferences", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();

        if (Objects.equals(country, "KSA")) {

            clevertapAdditionalInstanceConfig = CleverTapInstanceConfig.createInstance(
                    getReactApplicationContext(),
                    "TEST-W8W-6WR-846Z",
                    "TEST-206-0b0"
            );

            clevertapAdditionalInstanceConfig.setDebugLevel(CleverTapAPI.LogLevel.VERBOSE);
            clevertapAdditionalInstanceConfig.useGoogleAdId(false);
            clevertapAdditionalInstanceConfig.enablePersonalization(false);

            clevertapAdditionalInstance = CleverTapAPI.instanceWithConfig(getReactApplicationContext(), clevertapAdditionalInstanceConfig);
            
            // Store in SharedPreferences
            editor.putString("clevertapAccountID", "TEST-W8W-6WR-846Z");
            editor.putString("clevertapToken", "TEST-206-0b0");
            editor.apply();

        } else if (Objects.equals(country, "UAE")) {
            clevertapAdditionalInstanceConfig = CleverTapInstanceConfig.createInstance(
                    getReactApplicationContext(),
                    "TEST-RK4-66R-966Z",
                    "TEST-266-432"
            );

            clevertapAdditionalInstanceConfig.setDebugLevel(CleverTapAPI.LogLevel.VERBOSE);
            clevertapAdditionalInstanceConfig.useGoogleAdId(false);
            clevertapAdditionalInstanceConfig.enablePersonalization(false);

            clevertapAdditionalInstance = CleverTapAPI.instanceWithConfig(getReactApplicationContext(), clevertapAdditionalInstanceConfig);
   
            // Store in SharedPreferences
            editor.putString("clevertapAccountID", "TEST-RK4-66R-966Z");
            editor.putString("clevertapToken", "TEST-266-432");
            editor.apply();
        }
    }

    @ReactMethod
    public void promptForPushPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            Activity currentActivity = getCurrentActivity();
            if (currentActivity != null && clevertapAdditionalInstance != null) {
                HashMap<String, Object> profileUpdate = new HashMap<String, Object>();
                profileUpdate.put("MSG-push", true);
                clevertapAdditionalInstance.pushProfile(profileUpdate);
                clevertapAdditionalInstance.promptForPushPermission(true);
            }
        }
    }

    @Override
    public void onHostResume() {
        // Called when the application is resumed
        Log.d("CT", "onHostResume triggered");
        promptForPushPermission();
    }

    @Override
    public void onHostPause() {
        // Handle pause state if needed
        Log.d("CT", "onHostPause triggered");
    }

    @Override
    public void onHostDestroy() {
        // Cleanup resources if needed
        Log.d("CT", "onHostDestroy triggered");
    }


    @ReactMethod
    public void raiseEvent(String eventName , ReadableMap props) {
        Map<String, Object> finalProps = eventPropsFromReadableMap(props, Object.class);
           if (finalProps == null) {
               clevertapAdditionalInstance.pushEvent(eventName);
           } else {
               clevertapAdditionalInstance.pushEvent(eventName, finalProps);
           }
    }

    @ReactMethod
    public static CleverTapAPI getCleverTapInstance() {
        return clevertapAdditionalInstance;
    }

    @ReactMethod
    void callOnUserLogin() {
        HashMap<String, Object> profileUpdate = new HashMap<String, Object>();
        profileUpdate.put("Name", "React User 4"); 
        profileUpdate.put("Identity", "reactUser4"); 
        profileUpdate.put("Email", "reactuser4@test.com");
        profileUpdate.put("Phone", "+14155551234"); 

        clevertapAdditionalInstance.onUserLogin(profileUpdate);
    }

    @ReactMethod
    public static void resurrectApp(){
        Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        if (launchIntent != null) {
            context.startActivity(launchIntent);
        }
    }

    @SuppressWarnings("SameParameterValue")
    private <T> HashMap<String, T> eventPropsFromReadableMap(ReadableMap propsMap, Class<T> tClass) {
        if (propsMap == null) {
            return null;
        }

        HashMap<String, T> props = new HashMap<>();

        ReadableMapKeySetIterator iterator = propsMap.keySetIterator();

        while (iterator.hasNextKey()) {
            try {
                String key = iterator.nextKey();
                ReadableType readableType = propsMap.getType(key);

                if (readableType == ReadableType.String) {
                    props.put(key, tClass.cast(propsMap.getString(key)));
                } else if (readableType == ReadableType.Boolean) {
                    props.put(key, tClass.cast(propsMap.getBoolean(key)));
                } else if (readableType == ReadableType.Number) {
                    try {
                        props.put(key, tClass.cast(propsMap.getDouble(key)));
                    } catch (Throwable t) {
                        try {
                            props.put(key, tClass.cast(propsMap.getInt(key)));
                        } catch (Throwable t1) {
                            Log.e("CleverTapReactNative", "Unhandled ReadableType.Number from ReadableMap");
                        }
                    }
                } else {
                    Log.e("CleverTapReactNative", "Unhandled event property ReadableType");
                }
            } catch (Throwable t) {
                Log.e("CleverTapReactNative", t.getLocalizedMessage());
            }
        }
        return props;
    }
}
