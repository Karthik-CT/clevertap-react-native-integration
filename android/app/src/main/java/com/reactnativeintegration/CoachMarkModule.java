package com.reactnativeintegration;

import android.util.Log;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.clevertap.ct_templates.nd.coachmark.CoachMarkHelper;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import org.json.JSONObject;

import kotlin.Unit;

public class CoachMarkModule extends ReactContextBaseJavaModule {

    private static final String MODULE_NAME = "CoachMark";

    public CoachMarkModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void showCoachMarks(String unitJson, Callback callback) {
        try {
            AppCompatActivity activity = (AppCompatActivity) getCurrentActivity();
            if (activity == null) {
                callback.invoke("Error: Activity is null");
                return;
            }

            // Log the received JSON string
            Log.d(MODULE_NAME, "Received JSON string: " + unitJson);

            // Parse the string into a JSONObject
            JSONObject unit = new JSONObject(unitJson);

            // Initialize the CoachMarkHelper
            CoachMarkHelper coachMarkHelper = new CoachMarkHelper();

            // Render the CoachMarks
            coachMarkHelper.renderCoachMark(activity, unit, () -> {
                Log.d(MODULE_NAME, "CoachMarks completed.");
                callback.invoke(null, "CoachMarks completed");
                return Unit.INSTANCE; // Explicitly return Unit.INSTANCE
            });
        } catch (Exception e) {
            Log.e(MODULE_NAME, "Error rendering CoachMarks: ", e);
            callback.invoke("Error: " + e.getMessage());
        }
    }


}