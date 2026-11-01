import { I18nManager } from 'react-native';

/**
 * Deterministic RTL Layout Constants
 *
 * Guarantees that Arabic UI components always start from the RIGHT,
 * regardless of whether the physical device OS is configured in English or Arabic.
 */
export const isRTL = I18nManager.isRTL;

/**
 * When isRTL is false (English OS), 'row-reverse' places the 1st child at the RIGHT edge.
 * When isRTL is true (Arabic OS), 'row' naturally places the 1st child at the RIGHT edge.
 */
export const RTL_ROW: 'row' | 'row-reverse' = isRTL ? 'row' : 'row-reverse';

/**
 * To align content to the Arabic reading start (RIGHT edge):
 * In LTR, 'flex-end' points to the right.
 * In RTL, 'flex-start' points to the right.
 */
export const RTL_ALIGN: 'flex-start' | 'flex-end' = isRTL ? 'flex-start' : 'flex-end';
