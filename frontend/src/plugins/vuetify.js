/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { VDatePicker } from 'vuetify/labs/VDatePicker';

// Composables
import { createVuetify } from 'vuetify';


const brandedTheme = {
  dark: false,
  colors: {
    background: '#fff',
    surface: '#FFFFFF',
    primary: '#F6416C',
    'primary-darken-1': '#C62C50',
    secondary: '#00B8A9',
    'secondary-darken-1': '#018786',
    error: '#DB3C62',
    info: '#00A7b8',
    success: '#00B893',
    warning: '#DFBB52',
  },
};

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  defaults: {
    VTextField: {
      variant: 'outlined',
      class: 'mb-3',
    },
    VSelect: {
      variant: 'outlined',
      class: 'mb-3',
    },
    VCheckbox: {
      color: 'primary',
    },
    VBtn: {
      color: 'primary',
    }
  },
  theme: {
    defaultTheme: 'brandedTheme',
    themes: {
      brandedTheme,
    },
  },
  components: {
    VDatePicker,
  },
});
