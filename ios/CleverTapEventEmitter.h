#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>

@interface CleverTapEventEmitter : RCTEventEmitter <RCTBridgeModule>

- (void)sendEventWithName:(NSString *)name body:(id)body;

@end