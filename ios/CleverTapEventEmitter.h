//
//  CleverTapEventEmitter.h
//  ReactNativeIntegration
//
//  Created by Karthik Iyer on 17/01/25.
//


#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>

@interface CleverTapEventEmitter : RCTEventEmitter <RCTBridgeModule>

+ (void)sendURLToReactNative:(NSURL *)url;

@end
