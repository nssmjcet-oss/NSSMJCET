export const validateForm = (data, schema) => {
    const errors = {};
    let isValid = true;

    for (const field in schema) {
        const value = data[field];
        const rules = schema[field];

        if (rules.required && (!value || (Array.isArray(value) && value.length === 0))) {
            errors[field] = rules.message || `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
            isValid = false;
        } else if (value) {
            if (rules.email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    errors[field] = rules.message || 'Invalid email address';
                    isValid = false;
                }
            }
            if (rules.phone) {
                const phoneRegex = /^\d{10}$/;
                if (!phoneRegex.test(value)) {
                    errors[field] = rules.message || 'Invalid phone number (10 digits required)';
                    isValid = false;
                }
            }
        }
    }

    return { isValid, errors };
};
