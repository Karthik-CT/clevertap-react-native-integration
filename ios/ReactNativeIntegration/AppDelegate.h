#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
#import <UserNotifications/UserNotifications.h>
#import <CleverTap-iOS-SDK/CleverTapURLDelegate.h>
#import <CleverTap-iOS-SDK/CleverTapPushNotificationDelegate.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, CleverTapURLDelegate, CleverTapPushNotificationDelegate>

@property (nonatomic, strong) UIWindow *window;
@property (nonatomic,strong) NSDictionary *resp;
@property (nonatomic, strong) NSURL *lastHandledURL;
@end
