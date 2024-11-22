//
//  NotificationService.swift
//  NotificationService
//
//  Created by Karthik Iyer on 11/08/23.
//

import UserNotifications
import CleverTapSDK
import CTNotificationService

class NotificationService: CTNotificationServiceExtension {
  
  var contentHandler: ((UNNotificationContent) -> Void)?
  var bestAttemptContent: UNMutableNotificationContent?
  var cleverTapAdditionalInstance : CleverTap?
  
  override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
    
    let defaults = UserDefaults.init(suiteName: "group.clevertapTest")
    let countryId = defaults?.value(forKey: "countryId") as? String
    
    let AccountId = defaults?.value(forKey: "AccountId") as? String
    let AccountToken = defaults?.value(forKey: "AccountToken") as? String
    let emailId = defaults?.value(forKey: "email") as? String
    let userId = defaults?.value(forKey: "identity")
    
//    let AccountId = "TEST-W8W-6WR-846Z" as? String
//    let AccountToken = "TEST-206-0b0" as? String
//    let emailId = "rn4@rn.com" as? String
//    let userId = "rn4" as? String
    
    print("From Notification Service EmailID: \(String(describing: emailId))")
    
    let props = [
      "countryId": countryId,
      "AccountId": AccountId,
      "AccountToken": AccountToken,
      "emailId": emailId,
      "userId": userId
    ]

    
    let ctConfig = CleverTapInstanceConfig.init(accountId: AccountId as! String, accountToken: AccountToken as!String)
    ctConfig.logLevel = CleverTapLogLevel.debug
    ctConfig.analyticsOnly = false
    ctConfig.enablePersonalization = false
    cleverTapAdditionalInstance = CleverTap.instance(with: ctConfig)
    
    cleverTapAdditionalInstance?.recordEvent("NotificationServiceEventForPushImpression", withProps: props)
    
    if let emailId = emailId, let userId = userId {
      let profile: Dictionary<String, Any> = [
        "Identity": userId,
        "Email": emailId
      ]
      cleverTapAdditionalInstance?.onUserLogin(profile)
    }
    
    cleverTapAdditionalInstance?.recordNotificationViewedEvent(withData:request.content.userInfo)
    super.didReceive(request, withContentHandler: contentHandler)
  }
  
  override func serviceExtensionTimeWillExpire() {
    // Called just before the extension will be terminated by the system.
    // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
    if let contentHandler = contentHandler, let bestAttemptContent =  bestAttemptContent {
      contentHandler(bestAttemptContent)
    }
  }
  
}

