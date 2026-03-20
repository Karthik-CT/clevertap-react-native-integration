package com.reactnativeintegration;

import com.facebook.react.ReactActivity;
import com.clevertap.react.CleverTapModule;
import com.clevertap.android.sdk.CleverTapAPI;
import android.os.Bundle;
import android.content.Intent;
import android.os.Build;
import java.util.*;
import com.clevertap.android.sdk.PushPermissionResponseListener;
import com.clevertap.android.sdk.inapp.CTLocalInApp;
import org.json.*;
import android.util.Log;

public class MainActivity extends ReactActivity implements PushPermissionResponseListener {

  @Override
  protected String getMainComponentName() {
    return "ReactNativeIntegration";
  }
  
  protected Bundle getLaunchOptions() {
    Bundle extras = getIntent() != null ? getIntent().getExtras() : null;

    if (extras != null && extras.containsKey("screenName")) {
      String screenName = extras.getString("screenName", "");
      Log.d("MainActivity", "[CT] Cold-start push detected. screenName: " + screenName);

      Bundle initialProps = new Bundle();
      initialProps.putBoolean("isFromPush", true);
      initialProps.putString("pushTargetScreen", screenName);
      return initialProps;
    }

    Log.d("MainActivity", "[CT] Normal cold-start (no push extras).");
    return null;
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    CleverTapAPI.getDefaultInstance(this)
        .registerPushPermissionNotificationResponseListener(this);
  }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      CleverTapAPI.getDefaultInstance(getApplicationContext())
          .pushNotificationClickedEvent(intent.getExtras());
    }
  }

  private boolean pushPrimerShown = false;

  @Override
  public void onResume() {
    super.onResume();
    
    if (!pushPrimerShown) {
      pushPrimerShown = true;
      try {
        JSONObject jsonObject = CTLocalInApp.builder()
            .setInAppType(CTLocalInApp.InAppType.ALERT)
            .setTitleText("Get Notified")
            .setMessageText("Enable Notification permission")
            .followDeviceOrientation(true)
            .setPositiveBtnText("Allow")
            .setNegativeBtnText("Cancel")
            .build();
        CleverTapAPI.getDefaultInstance(this).promptPushPrimer(jsonObject);
        Log.d("MainActivity", "[CT] Push primer shown once for this session.");
      } catch (Exception e) {
        Log.e("MainActivity", "[CT] Push primer error: " + e.getMessage());
      }
    }
  }

  @Override
  public void onPushPermissionResponse(boolean accepted) {
    Log.i("MainActivity", "[CT] onPushPermissionResponse: accepted=" + accepted);
  }
}