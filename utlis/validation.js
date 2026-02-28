/**
 * Form validation utilities
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Object with isValid and message
 */
export function validatePassword(password) {
    if (!password || password.length < 8) {
        return {
            isValid: false,
            message: 'Password must be at least 8 characters long',
        };
    }

    if (!/[A-Z]/.test(password)) {
        return {
            isValid: false,
            message: 'Password must contain at least one uppercase letter',
        };
    }

    if (!/[a-z]/.test(password)) {
        return {
            isValid: false,
            message: 'Password must contain at least one lowercase letter',
        };
    }

    if (!/[0-9]/.test(password)) {
        return {
            isValid: false,
            message: 'Password must contain at least one number',
        };
    }

    return {
        isValid: true,
        message: 'Password is strong',
    };
}

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
export function isValidPhone(phone) {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @returns {boolean} - True if not empty
 */
export function isRequired(value) {
    if (typeof value === 'string') {
        return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
}

/**
 * Validate form data
 * @param {Object} data - Form data object
 * @param {Object} rules - Validation rules object
 * @returns {Object} - Object with isValid and errors
 */
export function validateForm(data, rules) {
    const errors = {};

    Object.keys(rules).forEach(field => {
        const rule = rules[field];
        const value = data[field];

        if (rule.required && !isRequired(value)) {
            errors[field] = rule.message || `${field} is required`;
        } else if (rule.email && !isValidEmail(value)) {
            errors[field] = 'Please enter a valid email address';
        } else if (rule.phone && !isValidPhone(value)) {
            errors[field] = 'Please enter a valid 10-digit phone number';
        } else if (rule.minLength && value.length < rule.minLength) {
            errors[field] = `Must be at least ${rule.minLength} characters`;
        } else if (rule.maxLength && value.length > rule.maxLength) {
            errors[field] = `Must be less than ${rule.maxLength} characters`;
        } else if (rule.custom && !rule.custom(value)) {
            errors[field] = rule.message || 'Invalid value';
        }
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}