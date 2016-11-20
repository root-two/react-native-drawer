import {
    I18nManager
} from 'react-native'

export function getRtlSide(side) {
	if (I18nManager.isRTL) {
		return side === 'left' ? 'right' : 'left'
	}

	return side
}
