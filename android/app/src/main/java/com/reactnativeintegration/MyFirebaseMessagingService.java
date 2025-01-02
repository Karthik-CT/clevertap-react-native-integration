package com.reactnativeintegration;

import android.os.Bundle;
import android.util.Log;
import com.clevertap.android.sdk.CleverTapAPI;
import com.clevertap.android.sdk.pushnotification.NotificationInfo;
import com.clevertap.android.sdk.pushnotification.fcm.CTFcmMessageHandler;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import java.util.Map;

public class MyFirebaseMessagingService extends FirebaseMessagingService {
    @Override
    public void onMessageReceived(RemoteMessage message){
        try {
            if (message.getData().size() > 0) {
                Bundle extras = new Bundle();
                for (Map.Entry<String, String> entry : message.getData().entrySet()) {
                    extras.putString(entry.getKey(), entry.getValue());
                    Log.d("pay", "entry.getKey()"+entry.getKey().toString());
                    Log.d("pay", "entry.Value()"+entry.getValue().toString());
                }
                Log.e("TAG","onReceived Mesaage Called");
                NotificationInfo info = CleverTapAPI.getNotificationInfo(extras);
                String mainKey = extras.getString("firstKey1");
                String mainValue = "firstValue1";
                if(mainKey == mainValue){
                    Log.d("pay", "I will not print it");
                } else {
                    Log.d("pay", "I will print it");
                    if (info.fromCleverTap) {
                        new CTFcmMessageHandler()
                                .createNotification(getApplicationContext(), message);
//                        CleverTapAPI.createNotification(getApplicationContext(), extras);
                    }
                }
                // if (info.fromCleverTap) {
                //     CleverTapAPI.createNotification(getApplicationContext(), extras);
                // }
                Log.d("pay",extras.toString());
                Log.d("pay",extras.getString("firstKey1"));
            }
        } catch (Throwable t) {
            Log.d("MYFCMLIST", "Error parsing FCM message", t);
        }
    }
    @Override
    public void onNewToken(String token) {
        CleverTapAPI.getDefaultInstance(this).pushFcmRegistrationId(token,true);
    }
}
