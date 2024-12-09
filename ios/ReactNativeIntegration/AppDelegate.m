#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <CleverTap-iOS-SDK/CleverTap.h>
#import <clevertap-react-native/CleverTapReactManager.h>
#import <React/RCTLinkingManager.h>
#import <CleverTap-iOS-SDK/CleverTapInstanceConfig.h>

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
  // integrate CleverTap SDK using the autoIntegrate option
  [CleverTap autoIntegrate];
  [CleverTap setDebugLevel:CleverTapLogDebug];
  [[CleverTapReactManager sharedInstance] applicationDidLaunchWithOptions:launchOptions];
  
  //URL delegate set
  [[CleverTap sharedInstance]setUrlDelegate:self];
  
  //
  //  // Config an additional instance
  //  CleverTapInstanceConfig *ctConfig = [[CleverTapInstanceConfig alloc] initWithAccountId:@"TEST-W8W-6WR-846Z" accountToken:@"TEST-W8W-6WR-846Z"];
  //  [ctConfig setLogLevel:CleverTapLogDebug];
  //  [ctConfig setAnalyticsOnly:NO];
  //  [ctConfig setEnablePersonalization:NO];
  //
  //  CleverTap *additionalCleverTapInstance = [CleverTap instanceWithConfig:ctConfig];
  //  [additionalCleverTapInstance enableDeviceNetworkInfoReporting:YES];
  //  [additionalCleverTapInstance notifyApplicationLaunchedWithOptions:nil];
  
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
  completionHandler();
}
-(void) userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler{
  completionHandler(UNAuthorizationOptionAlert | UNAuthorizationOptionBadge | UNAuthorizationOptionSound);
}

// CleverTapURLDelegate method
- (BOOL)shouldHandleCleverTapURL:(NSURL *)url forChannel:(CleverTapChannel)channel {
    NSLog(@"Handling URL: \(%@) for channel: \(%d)", url, channel);
    return YES;
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
