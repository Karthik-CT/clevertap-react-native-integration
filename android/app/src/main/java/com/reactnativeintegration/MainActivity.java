package com.reactnativeintegration;

import com.facebook.react.ReactActivity;
import com.clevertap.react.CleverTapModule;
import android.os.Bundle;
import android.content.Intent;
import android.os.Build;
import java.util.*;
import com.clevertap.android.sdk.PushPermissionResponseListener;
import com.clevertap.android.sdk.inapp.CTLocalInApp;
import org.json.*;
import android.util.Log;
import android.content.SharedPreferences;
import android.content.Context;
import com.clevertap.android.sdk.CleverTapInstanceConfig;
import com.clevertap.android.sdk.CleverTapAPI;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.*;
import com.reactnativeintegration.CTModule;

public class MainActivity extends ReactActivity{

  CTModule ctModule;

  @Override
  protected String getMainComponentName() {
    return "ReactNativeIntegration";
  }

  @Override
	protected void onCreate(Bundle savedInstanceState) {
    	super.onCreate(savedInstanceState);
//    	CleverTapModule.setInitialUri(getIntent().getData());
        // CleverTapAPI.getDefaultInstance(this).registerPushPermissionNotificationResponseListener(this);
        

      // CleverTapAPI.setNotificationHandler((NotificationHandler)new PushTemplateNotificationHandler());
      // ctModule = new CTModule();  
  }

  @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        if (intent != null && intent.getExtras() != null) {
          CleverTapAPI clevertapInstance = CTModule.getCleverTapInstance();
          if (clevertapInstance != null) {
              clevertapInstance.pushNotificationClickedEvent(intent.getExtras());
              Log.d("MainActivity", "Notification clicked event raised");
          } else {
              Log.e("MainActivity", "CleverTap instance is null. Event not raised.");
          }
        }
      }
      // CTModule.resurrectApp();
    }

    @Override
    public void onResume() {
      super.onResume();
      // JSONObject jsonObject = CTLocalInApp.builder()
      //   .setInAppType(CTLocalInApp.InAppType.ALERT)
      //   .setTitleText("Get Notified")
      //   .setMessageText("Enable Notification permission")
      //   .followDeviceOrientation(true)
      //   .setPositiveBtnText("Allow")
      //   .setNegativeBtnText("Cancel")
      //   .build();

      // CleverTapAPI.getDefaultInstance(this).promptPushPrimer(jsonObject);


      // CTModule.resurrectApp();

      // SharedPreferences sharedPreferences = getSharedPreferences("CTPreferences", Context.MODE_PRIVATE);
      // String clevertapAccountID = sharedPreferences.getString("clevertapAccountID", null);
      // String clevertapToken = sharedPreferences.getString("clevertapToken", null);
      // ctModule.promptForPushPermission();

    }

}
