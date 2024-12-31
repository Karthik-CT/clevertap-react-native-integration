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
#import "CLTModule.h"
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

@interface CLTModule() <CleverTapDisplayUnitDelegate, CleverTapPushNotificationDelegate, CleverTapPushPermissionDelegate> {
}

@end

@implementation CLTModule



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
    ctConfig.disableIDFV = false;
    cleverTapAdditionalInstance = [CleverTap instanceWithConfig:ctConfig];
    [cleverTapAdditionalInstance enableDeviceNetworkInfoReporting:true];
    [cleverTapAdditionalInstance notifyApplicationLaunchedWithOptions:nil];
    if(APNSPushToken != nil){
      [cleverTapAdditionalInstance setPushToken:APNSPushToken];
    }
    NSUserDefaults *defaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.clevertapTest"];
    NSString *countryAccountID = cleverTapId;
    NSString *countryAccountToken = cleverTapToken;
    [defaults setObject:countryAccountID forKey:@"countryAccountID"];
    [defaults setObject:countryAccountToken forKey:@"countryAccountToken"];
    
  } else if([type isEqual:@"ksa"]){
    CleverTapInstanceConfig *ctConfigKSA = [[CleverTapInstanceConfig alloc] initWithAccountId:cleverTapId accountToken:cleverTapToken];
    [ctConfigKSA setLogLevel:CleverTapLogDebug];
    ctConfigKSA.disableIDFV = false;
    
    cleverTapAdditionalInstanceKSA = [CleverTap instanceWithConfig:ctConfigKSA];
    [cleverTapAdditionalInstanceKSA enableDeviceNetworkInfoReporting:true];
    [cleverTapAdditionalInstanceKSA notifyApplicationLaunchedWithOptions:nil];
    if(APNSPushToken != nil){
      [cleverTapAdditionalInstanceKSA setPushToken:APNSPushToken];
    }
    NSUserDefaults *defaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.clevertapTest"];
    NSString *countryAccountID = cleverTapId;
    NSString *countryAccountToken = cleverTapToken;
    [defaults setObject:countryAccountID forKey:@"countryAccountID"];
    [defaults setObject:countryAccountToken forKey:@"countryAccountToken"];
    
  }
#ifdef DEBUG
  [CleverTap setDebugLevel:CleverTapLogDebug];
#else
  [CleverTap setDebugLevel:CleverTapLogOff];
#endif
  
  if([type isEqual:@"uae"]){
    return cleverTapAdditionalInstance;
  }else if([type isEqual:@"ksa"]){
    return cleverTapAdditionalInstanceKSA;
  }
  
  return NULL;
}
RCT_EXPORT_METHOD(initializeCleverTap:(NSString*)countryId passCleverTapId:(NSString*)passCleverTapId passCleverTapToken:(NSString*)passCleverTapToken){
  RCTLogInfo(@"[CleverTap initializeCleverTap]: %@ %@", passCleverTapId, passCleverTapToken);
  CleverTap *cleverTapInstance = getCleverTapAPI(countryId,passCleverTapId,passCleverTapToken);
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

RCT_EXPORT_METHOD(setupProjectId:(NSString*)countryId passCleverTapId:(NSString*)passCleverTapId passCleverTapToken:(NSString*)passCleverTapToken)
{
  
  CleverTap *cleverTapInstance = getCleverTapAPI(countryId,passCleverTapId,passCleverTapToken);
}


RCT_EXPORT_METHOD(raiseEvent:(NSString*)countryId passCleverTapId:(NSString*)passCleverTapId passCleverTapToken:(NSString*)passCleverTapToken eventName:(NSString*)eventName withProps:(NSDictionary*)props)
{
  
  CleverTap *cleverTapInstance = getCleverTapAPI(countryId,passCleverTapId,passCleverTapToken);
  
  [cleverTapInstance recordEvent:eventName withProps:props];
}

RCT_EXPORT_METHOD(callOnUserLogin:(NSString*)countryId passCleverTapId:(NSString*)passCleverTapId passCleverTapToken:(NSString*)passCleverTapToken withProps:(NSDictionary*)props)
{
  CleverTap *cleverTapInstance = getCleverTapAPI(countryId,passCleverTapId,passCleverTapToken);
  [cleverTapInstance onUserLogin:props];
  
}

RCT_EXPORT_METHOD(callprofilePush:(NSString*)countryId passCleverTapId:(NSString*)passCleverTapId passCleverTapToken:(NSString*)passCleverTapToken withProps:(NSDictionary*)props)
{
  CleverTap *cleverTapInstance = getCleverTapAPI(countryId,passCleverTapId,passCleverTapToken);
  [cleverTapInstance profilePush:props];
  
}

RCT_EXPORT_METHOD(recordChargedEvent:(NSString*)countryId passCleverTapId:(NSString*)passCleverTapId passCleverTapToken:(NSString*)passCleverTapToken withProps:(NSDictionary*)details andItems:(NSArray*)items)
{
  CleverTap *cleverTapInstance = getCleverTapAPI(countryId,passCleverTapId,passCleverTapToken);
  [cleverTapInstance recordChargedEventWithDetails:details andItems:items];
  
  
}

- (void)postNotificationWithName:(NSString *)name andBody:(NSDictionary *)body {
  [[NSNotificationCenter defaultCenter] postNotificationName:name object:nil userInfo:body];
}

RCT_EXPORT_METHOD(pushNotificationClickedEvents:(NSString*)countryId passCleverTapId:(NSString*)passCleverTapId passCleverTapToken:(NSString*)passCleverTapToken response:(NSString*)response)
{
  RCTLogInfo(@"[CleverTap getCleverTapID]");
  CleverTap *cleverTapInstance = getCleverTapAPI(countryId,passCleverTapId,passCleverTapToken);
  [cleverTapInstance recordNotificationClickedEventWithData:response];
}

RCT_EXPORT_METHOD(setUserDetailsInAppGroups:(NSString*)countryId passCleverTapId:(NSString*)passCleverTapId passCleverTapToken:(NSString*)passCleverTapToken email:(NSString*)email identity:(NSString*)identity )
{
  RCTLogInfo(@"App Groups set called");
  NSUserDefaults *mySharedDefaults = [[NSUserDefaults alloc] initWithSuiteName: @"group.clevertapTest"];
  [mySharedDefaults setObject:countryId forKey:@"countryId"];
  [mySharedDefaults setObject:passCleverTapId forKey:@"AccountId"];
  [mySharedDefaults setObject:passCleverTapToken forKey:@"AccountToken"];
  [mySharedDefaults setObject:email forKey:@"email"];
  [mySharedDefaults setObject:identity forKey:@"identity"];
  [mySharedDefaults synchronize];
  
}

RCT_EXPORT_METHOD(getUserDetailsFromAppGroups:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSLog(@"[getUserDetailsFromAppGroups] Fetching user details from app groups...");
  
  NSUserDefaults *mySharedDefaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.clevertapTest"];
  
  NSString *countryId = [mySharedDefaults stringForKey:@"countryId"];
  NSString *cleverTapId = [mySharedDefaults stringForKey:@"AccountId"];
  NSString *cleverTapToken = [mySharedDefaults stringForKey:@"AccountToken"];
  NSString *email = [mySharedDefaults stringForKey:@"email"];
  NSString *identity = [mySharedDefaults stringForKey:@"identity"];
  
  NSLog(@"[getUserDetailsFromAppGroups] countryId: %@", countryId ?: @"nil");
  NSLog(@"[getUserDetailsFromAppGroups] cleverTapId: %@", cleverTapId ?: @"nil");
  NSLog(@"[getUserDetailsFromAppGroups] cleverTapToken: %@", cleverTapToken ?: @"nil");
  NSLog(@"[getUserDetailsFromAppGroups] email: %@", email ?: @"nil");
  NSLog(@"[getUserDetailsFromAppGroups] identity: %@", identity ?: @"nil");
  
  if (countryId && cleverTapId && cleverTapToken && email && identity) {
    NSDictionary *userDetails = @{
      @"countryId": countryId,
      @"cleverTapId": cleverTapId,
      @"cleverTapToken": cleverTapToken,
      @"email": email,
      @"identity": identity
    };
    NSLog(@"[getUserDetailsFromAppGroups] Successfully retrieved user details: %@", userDetails);
    resolve(userDetails);
  } else {
    NSLog(@"[getUserDetailsFromAppGroups] Failed to retrieve all user details from app groups.");
    NSError *error = [NSError errorWithDomain:@"AppGroupsErrorDomain"
                                         code:404
                                     userInfo:@{NSLocalizedDescriptionKey: @"User details not found in app groups"}];
    reject(@"no_user_details", @"User details not found in app groups", error);
  }
}



RCT_EXPORT_METHOD(intializeNotificationClickedEvent)
{
  NSUserDefaults *mySharedDefaults = [[NSUserDefaults alloc] initWithSuiteName: @"group.clevertapTest"];
  NSString *passCleverTapId = [mySharedDefaults stringForKey:@"AccountId"];
  NSString *countryId = [mySharedDefaults stringForKey:@"countryId"];
  NSString *passCleverTapToken =  [mySharedDefaults stringForKey:@"AccountToken"];
  NSString *email = [mySharedDefaults stringForKey:@"email"] ;
  NSDictionary *profile = @{
    @"Email": email,
  };
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

RCT_EXPORT_METHOD(printStoredValues:(RCTResponseSenderBlock)callback)
{
  // Access the app group UserDefaults
  NSUserDefaults *defaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.clevertapTest"];
  
  // Retrieve values stored in UserDefaults
  NSString *storedUrlString = [defaults objectForKey:@"redirectionUrl"];
  NSString *channelValue = [[defaults objectForKey:@"channel_value"] stringValue];
  NSString *channelName = [defaults objectForKey:@"channel_name"];
  
  // Prepare the response dictionary
  NSDictionary *response = @{
    @"redirectionUrl": storedUrlString ?: @"",
    @"channelValue": channelValue ?: @"",
    @"channelName": channelName ?: @""
  };

  // Return the response to the JavaScript side
  callback(@[[NSNull null], response]);
}


@end
