#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <CleverTap-iOS-SDK/CleverTap.h>
#import <clevertap-react-native/CleverTapReactManager.h>
#import <React/RCTLinkingManager.h>
#import <CleverTap-iOS-SDK/CleverTapURLDelegate.h>
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
  
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
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
