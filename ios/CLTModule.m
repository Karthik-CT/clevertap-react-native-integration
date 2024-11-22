//
//  CTModule.m
//  ReactNativeIntegration
//
//  Created by Karthik Iyer on 21/11/24.
//

#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#import <React/RCTLog.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>
#import <UserNotifications/UserNotifications.h>
#import "CTModule.h"
#import "CleverTapReact.h"
#import "CleverTapReactManager.h"
#import "CleverTap.h"
#import <CleverTap-iOS-SDK/CleverTap.h>
#import <CleverTapInstanceConfig.h>
#import "CleverTap+DisplayUnit.h"
#import "CleverTap+CTVar.h"
#import "CTVar.h"
#import "CleverTapPushNotificationDelegate.h"
#import "CleverTap+PushPermission.h"

@interface CTModule() <CleverTapDisplayUnitDelegate, CleverTapPushNotificationDelegate, CleverTapPushPermissionDelegate> {
}

@end

@implementation CTModule

 

RCT_EXPORT_MODULE()

 

+ (BOOL)requiresMainQueueSetup

{

  return YES;

}

 + (instancetype)sharedInstance {
   static CleverTapReactManager *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[self alloc] init];
    });
    return sharedInstance;
}


- (void)setDelegates:(CleverTap *)cleverTapInstances {
    [cleverTapInstances setDisplayUnitDelegate:self];
    [cleverTapInstances setPushNotificationDelegate:self];
//    [cleverTapInstances setPushPermissionDelegate:self];
   }

CleverTap* getCleverTapAPI(NSString* type, NSString* cleverTapId, NSString* cleverTapToken) {

//  NSString *type = [[NSString alloc] init];
  CleverTap *cleverTapAdditionalInstance = NULL;
  CleverTap *cleverTapAdditionalInstanceKSA = NULL;
  
  NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
  NSObject *APNSPushToken = [prefs objectForKey:@"APNSPushToken"];

  if([type isEqual:@"uae"]){
  
    CleverTapInstanceConfig *ctConfig = [[CleverTapInstanceConfig alloc] initWithAccountId:cleverTapId accountToken:cleverTapToken];
    [ctConfig setLogLevel:CleverTapLogDebug];
    ctConfig.disableIDFV = true;
    cleverTapAdditionalInstance = [CleverTap instanceWithConfig:ctConfig];
    [cleverTapAdditionalInstance enableDeviceNetworkInfoReporting:true];
    [cleverTapAdditionalInstance notifyApplicationLaunchedWithOptions:nil];
    RCTLogInfo(@"uae APNSPushToken %@", APNSPushToken );
    if(APNSPushToken != nil){
      [cleverTapAdditionalInstance setPushToken:APNSPushToken];
    }
    RCTLogInfo(@"storeId selected uae %@", type );
    RCTLogInfo(@"storeId selected uae id %@", cleverTapId );
    RCTLogInfo(@"storeId selected uae token %@", cleverTapToken );
  
  } else if([type isEqual:@"ksa"]){
    CleverTapInstanceConfig *ctConfigKSA = [[CleverTapInstanceConfig alloc] initWithAccountId:cleverTapId accountToken:cleverTapToken];
    [ctConfigKSA setLogLevel:CleverTapLogDebug];
    ctConfigKSA.disableIDFV = true;

    cleverTapAdditionalInstanceKSA = [CleverTap instanceWithConfig:ctConfigKSA];
    [cleverTapAdditionalInstanceKSA enableDeviceNetworkInfoReporting:true];
    [cleverTapAdditionalInstanceKSA notifyApplicationLaunchedWithOptions:nil];
    if(APNSPushToken != nil){
      [cleverTapAdditionalInstanceKSA setPushToken:APNSPushToken];
    }
    RCTLogInfo(@"storeId selected ksa APNSPushToken %@", APNSPushToken );
  
    
    RCTLogInfo(@" selected ksa %@", type );
    RCTLogInfo(@"storeId selected ksa id %@", cleverTapId );
    RCTLogInfo(@"storeId selected ksa token %@", cleverTapToken );
  
  }
  #ifdef DEBUG
   [CleverTap setDebugLevel:CleverTapLogDebug];
#else
   [CleverTap setDebugLevel:CleverTapLogOff];
#endif
 
  if([type isEqual:@"uae"]){
    RCTLogInfo(@"storeId selected uae %@", type );
    return cleverTapAdditionalInstance;
  }else if([type isEqual:@"ksa"]){
    RCTLogInfo(@"storeId selected ksa %@", type );
    return cleverTapAdditionalInstanceKSA;
  }

  return NULL;
}
RCT_EXPORT_METHOD(intilaliazeListner:(NSString*)storeId passCleverTapId:(NSString*)passCleverTapId passCleverTapToken:(NSString*)passCleverTapToken){
    RCTLogInfo(@"[CleverTap intilaliazeListner]");
    CleverTap *cleverTapInstance = getCleverTapAPI(storeId,passCleverTapId,passCleverTapToken);
    [self setDelegates:cleverTapInstance];
}

RCT_EXPORT_METHOD(registerForPush) {
    RCTLogInfo(@"[CleverTap registerForPush]");
    if (floor(NSFoundationVersionNumber) > NSFoundationVersionNumber_iOS_9_x_Max) {
        UNUserNotificationCenter* center = [UNUserNotificationCenter currentNotificationCenter];
        [center requestAuthorizationWithOptions:(UNAuthorizationOptionAlert | UNAuthorizationOptionSound | UNAuthorizationOptionBadge)
                              completionHandler:^(BOOL granted, NSError * _Nullable error) {
            if (granted) {
                dispatch_async(dispatch_get_main_queue(), ^(void) {
                    [[UIApplication sharedApplication] registerForRemoteNotifications];
                });
            }
        }];
        
    }
    else {
        UIUserNotificationSettings *settings = [UIUserNotificationSettings settingsForTypes:(UIUserNotificationTypeBadge | UIUserNotificationTypeAlert | UIUserNotificationTypeSound) categories:nil];
        [[UIApplication sharedApplication] registerForRemoteNotifications];
        [[UIApplication sharedApplication] registerUserNotificationSettings:settings];
    }
}

// Check the device for flash capabilities and return callback of success // or fail

RCT_EXPORT_METHOD(setupProjectId:(NSString*)storeId passCleverTapId:(NSString*)passCleverTapId passCleverTapToken:(NSString*)passCleverTapToken)
{
  
  CleverTap *cleverTapInstance = getCleverTapAPI(storeId,passCleverTapId,passCleverTapToken);
  RCTLogInfo(@"storeId register");
}


RCT_EXPORT_METHOD(raiseEvent:(NSString*)storeId passCleverTapId:(NSString*)passCleverTapId passCleverTapToken:(NSString*)passCleverTapToken eventName:(NSString*)eventName withProps:(NSDictionary*)props)
{
  
  CleverTap *cleverTapInstance = getCleverTapAPI(storeId,passCleverTapId,passCleverTapToken);

  RCTLogInfo(@"storeId event %@ on %@ with %@", eventName, storeId,props );
  
  [cleverTapInstance recordEvent:eventName withProps:props];


}

RCT_EXPORT_METHOD(callOnUserLogin:(NSString*)storeId passCleverTapId:(NSString*)passCleverTapId passCleverTapToken:(NSString*)passCleverTapToken withProps:(NSDictionary*)props)
{
  CleverTap *cleverTapInstance = getCleverTapAPI(storeId,passCleverTapId,passCleverTapToken);

  RCTLogInfo(@"storeId Profile on %@ with %@", storeId,props);
 [cleverTapInstance onUserLogin:props];

}

RCT_EXPORT_METHOD(callprofilePush:(NSString*)storeId passCleverTapId:(NSString*)passCleverTapId passCleverTapToken:(NSString*)passCleverTapToken withProps:(NSDictionary*)props)
{
  CleverTap *cleverTapInstance = getCleverTapAPI(storeId,passCleverTapId,passCleverTapToken);

  RCTLogInfo(@"storeId profilePush on %@ with %@", storeId,props);
 [cleverTapInstance profilePush:props];

}

RCT_EXPORT_METHOD(recordChargedEvent:(NSString*)storeId passCleverTapId:(NSString*)passCleverTapId passCleverTapToken:(NSString*)passCleverTapToken withProps:(NSDictionary*)details andItems:(NSArray*)items)
{
  CleverTap *cleverTapInstance = getCleverTapAPI(storeId,passCleverTapId,passCleverTapToken);

  RCTLogInfo(@"storeId Charged on %@ with %@ of %@", storeId, details, items );
  [cleverTapInstance recordChargedEventWithDetails:details andItems:items];


}

- (void)postNotificationWithName:(NSString *)name andBody:(NSDictionary *)body {
    [[NSNotificationCenter defaultCenter] postNotificationName:name object:nil userInfo:body];
}

RCT_EXPORT_METHOD(pushNotificationClickedEvents:(NSString*)storeId passCleverTapId:(NSString*)passCleverTapId passCleverTapToken:(NSString*)passCleverTapToken response:(NSString*)response)
{
    RCTLogInfo(@"[CleverTap getCleverTapID]");
    CleverTap *cleverTapInstance = getCleverTapAPI(storeId,passCleverTapId,passCleverTapToken);
    [cleverTapInstance recordNotificationClickedEventWithData:response];
}
// RCT_EXPORT_METHOD(SetUserDetails:(NSString*)){
RCT_EXPORT_METHOD(setUserDetails:(NSString*)storeId passCleverTapId:(NSString*)passCleverTapId passCleverTapToken:(NSString*)passCleverTapToken email:(NSString*)email ) {
  RCTLogInfo(@"[CleverTap setUserDetails]");
  
  NSUserDefaults *mySharedDefaults = [[NSUserDefaults alloc] initWithSuiteName: @"group.nazih"];
  [mySharedDefaults setObject:passCleverTapId forKey:@"AccountId"];
  [mySharedDefaults setObject:storeId forKey:@"storeId"];
  [mySharedDefaults setObject:passCleverTapToken forKey:@"AccountToken"];
  [mySharedDefaults setObject:email forKey:@"email"];

}

RCT_EXPORT_METHOD(intializeNotificationClickedEvent)
{
    RCTLogInfo(@"[CleverTap pushNotificationClickedEvent]");
    // getting an NSString
//    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
  
    NSUserDefaults *mySharedDefaults = [[NSUserDefaults alloc] initWithSuiteName: @"group.nazih"];

    NSString *passCleverTapId = [mySharedDefaults stringForKey:@"AccountId"]; //UserDefaults.standard.string(forKey: "AccountId")!
    NSString *storeId = [mySharedDefaults stringForKey:@"storeId"];  //UserDefaults.standard.string(forKey: "storeId")!
    NSString *passCleverTapToken =  [mySharedDefaults stringForKey:@"AccountToken"]; //UserDefaults.standard.string(forKey: "AccountToken")!

    NSString *email = [mySharedDefaults stringForKey:@"email"] ;
    NSDictionary *profile = @{
                            @"Email": email,
                              };
  if(email) {
   RCTLogInfo(@"storeId Charged on %@ with %@ of %@ of %@ of %@", passCleverTapId, storeId, passCleverTapToken,  email,profile);
  }
  RCTLogInfo(@"storeId Charged on %@ with %@ of %@ of", passCleverTapId, storeId, passCleverTapToken);
}

#pragma mark - CleverTapPushPermissionDelegate


#pragma mark - Private/Helpers

- (void)returnResult:(id)result withCallback:(RCTResponseSenderBlock)callback andError:(NSString *)error {
    if (callback == nil) {
        RCTLogInfo(@"CleverTap callback was nil");
        return;
    }
    id e  = error != nil ? error : [NSNull null];
    id r  = result != nil ? result : [NSNull null];
    callback(@[e,r]);
}

@end
