//
//  CleverTapEventEmitter.m
//  ReactNativeIntegration
//
//  Created by Karthik Iyer on 17/01/25.
//
//

#import "CleverTapEventEmitter.h"

static NSString *const kCleverTapURLTappedEvent = @"CleverTapURLTapped";

static CleverTapEventEmitter *sharedInstance = nil;

@implementation CleverTapEventEmitter

RCT_EXPORT_MODULE();

+ (instancetype)sharedInstance {
    return sharedInstance;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        sharedInstance = self;
    }
    return self;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[kCleverTapURLTappedEvent];
}

+ (void)sendURLToReactNative:(NSURL *)url {
    if (sharedInstance != nil) {
        [sharedInstance sendEventWithName:kCleverTapURLTappedEvent body:@{@"url": url.absoluteString}];
    } else {
        NSLog(@"CleverTapEventEmitter: No active event emitter instance found.");
    }
}

@end
