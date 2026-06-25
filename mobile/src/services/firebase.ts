import analytics from "@react-native-firebase/analytics";
import crashlytics from "@react-native-firebase/crashlytics";

export const logEvent = async (name: string, params?: Record<string, unknown>) => {
  await analytics().logEvent(name, params);
};

export const logScreenView = async (screenName: string) => {
  await analytics().logScreenView({ screen_name: screenName, screen_class: screenName });
};

export const recordError = (error: Error, context?: string) => {
  crashlytics().recordError(error, context);
};

export const setUserId = async (userId: string) => {
  await analytics().setUserId(userId);
  await crashlytics().setUserId(userId);
};
