#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <CleverTap-iOS-SDK/CleverTap.h>
#import <clevertap-react-native/CleverTapReactManager.h>
#import <React/RCTLinkingManager.h>
#import <CleverTap-iOS-SDK/CleverTapInstanceConfig.h>
#import <React/RCTLog.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"ReactNativeIntegration"
                                            initialProperties:nil];
  
  if (@available(iOS 13.0, *)) {
    rootView.backgroundColor = [UIColor systemBackgroundColor];
  } else {
    rootView.backgroundColor = [UIColor whiteColor];
  }
  
  [self registerForPush];
  
  [CleverTap autoIntegrate];
  
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
  // Access shared UserDefaults
  NSUserDefaults *defaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.clevertapTest"];
  
  // Safely unwrap and handle nil cases
  NSString *appgroupsAccountId = [defaults valueForKey:@"countryAccountID"];
  NSString *appgroupsAccountToken = [defaults valueForKey:@"countryAccountToken"];
  
  if (!appgroupsAccountId || !appgroupsAccountToken) {
    NSLog(@"CleverTap account details not set in UserDefaults!");
    return YES; // Continue app launch to allow ViewController to set defaults
  }
  
  // Initialize CleverTap configuration
  CleverTapInstanceConfig *ctConfig = [[CleverTapInstanceConfig alloc] initWithAccountId:appgroupsAccountId accountToken:appgroupsAccountToken];
  CleverTap *cleverTapAdditionalInstance = [CleverTap instanceWithConfig:ctConfig];
  [cleverTapAdditionalInstance setUrlDelegate:self];
  
  return YES;
}

- (BOOL)shouldHandleCleverTapURL:(NSURL *)url forChannel:(CleverTapChannel)channel {
  NSLog(@"Handling URL: \(%@) for channel: \(%d)", url, channel);
  NSUserDefaults *defaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.clevertapTest"];
  
  // Convert NSURL to NSString before storing
  NSString *urlString = [url absoluteString];
  [defaults setObject:urlString forKey:@"redirectionUrl"];
  
  if (channel == 0) {
    [defaults setObject:@(0) forKey:@"channel_value"];
    [defaults setObject:@"CleverTapPushNotification" forKey:@"channel_name"];
  } else if (channel == 1) {
    [defaults setObject:@(1) forKey:@"channel_value"];
    [defaults setObject:@"CleverTapAppInbox" forKey:@"channel_name"];
  } else if (channel == 2) {
    [defaults setObject:@(2) forKey:@"channel_value"];
    [defaults setObject:@"CleverTapInAppNotification" forKey:@"channel_name"];
  }
  return YES;
}

-(void) registerForPush {
  
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  UNNotificationAction *action1 = [UNNotificationAction actionWithIdentifier:@"action_1" title:@"Back" options:UNNotificationActionOptionNone];
  UNNotificationAction *action2 = [UNNotificationAction actionWithIdentifier:@"action_2" title:@"Next" options:UNNotificationActionOptionNone];
  UNNotificationAction *action3 = [UNNotificationAction actionWithIdentifier:@"action_3" title:@"View In App" options:UNNotificationActionOptionNone];
  UNNotificationCategory *cat = [UNNotificationCategory categoryWithIdentifier:@"CTNotification" actions:@[action1, action2, action3] intentIdentifiers:@[] options:UNNotificationCategoryOptionNone];
  [center setNotificationCategories:[NSSet setWithObjects:cat, nil]];
  
  center.delegate = self;
  [center requestAuthorizationWithOptions:(UNAuthorizationOptionSound | UNAuthorizationOptionAlert | UNAuthorizationOptionBadge) completionHandler:^(BOOL granted, NSError * _Nullable error){
    if(!error){
      dispatch_async(dispatch_get_main_queue(), ^{
        [[UIApplication sharedApplication] registerForRemoteNotifications];
      });
    }
  }];
  
}

//Device Token
-(void) application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken{
  NSLog(@"Device Token : %@",deviceToken);
  NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
  [prefs setObject:deviceToken forKey:@"APNSPushToken"];
  [prefs synchronize];
}

-(void) application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error{
  NSLog(@"Error %@",error.description);
}

- (BOOL)application:(UIApplication *)application handleOpenURL:(NSURL *)url {
  // Do something with the url here
  NSLog(@"URL Received from CT: %@", url);
  return YES;
}

//Handle Deeplink
-(BOOL) application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  NSLog(url);
  return [RCTLinkingManager application:app openURL:url options:options];
  
}
-(BOOL) application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler{
  
  
  NSLog(@"%@",userActivity.webpageURL);
  
  return TRUE;
  
}
-(BOOL)application:(UIApplication *)application willContinueUserActivityWithType:(NSString *)userActivityType{
  
  return TRUE;
}
//PN Delgates
-(void) userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler{
  
  self.resp = response.notification.request.content.userInfo;
  
  //get the details stored in app groups
  NSUserDefaults *mySharedDefaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.clevertapTest"];
  NSString *countryId = [mySharedDefaults stringForKey:@"countryId"];
  NSString *cleverTapId = [mySharedDefaults stringForKey:@"AccountId"];
  NSString *cleverTapToken = [mySharedDefaults stringForKey:@"AccountToken"];
  NSString *email = [mySharedDefaults stringForKey:@"email"];
  NSString *identity = [mySharedDefaults stringForKey:@"identity"];
  NSLog(@"Account ID from App Delegate didReceive %@ %@", cleverTapId, cleverTapToken);
  
  // create the instance using the above details
  CleverTapInstanceConfig *ctConfig = [[CleverTapInstanceConfig alloc] initWithAccountId:(NSString *)cleverTapId accountToken:(NSString *)cleverTapToken];
  CleverTap *cleverTapAdditionalInstance = [CleverTap instanceWithConfig:ctConfig];
  [cleverTapAdditionalInstance recordNotificationClickedEventWithData:response.notification.request.content.userInfo];
  
  completionHandler();
}
-(void) userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler{
  completionHandler(UNAuthorizationOptionAlert | UNAuthorizationOptionBadge | UNAuthorizationOptionSound);
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
