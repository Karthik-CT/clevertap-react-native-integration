package com.reactnativeintegration;

import com.facebook.react.ReactActivity;
import com.clevertap.react.CleverTapModule;
import android.os.Bundle;
import android.content.Intent;
import android.os.Build;
import com.clevertap.android.sdk.CleverTapAPI;
import java.util.*;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */


  // CleverTapAPI clevertapDefaultInstance = CleverTapAPI.getDefaultInstance(getApplicationContext());


  @Override
  protected String getMainComponentName() {
    return "ReactNativeIntegration";
  }

  @Override
	protected void onCreate(Bundle savedInstanceState) {
    	super.onCreate(savedInstanceState);
    	CleverTapModule.setInitialUri(getIntent().getData());
	}


  // @Override
	// protected void onNewIntent(Intent intent) {
  //   super.onNewIntent(intent);
  //   if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
  //     clevertapDefaultInstance.pushNotificationClickedEvent(intent.getExtras());
  //   }
  // }

}
