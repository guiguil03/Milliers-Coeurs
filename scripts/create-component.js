const fs = require('fs');
const path = require('path');

const componentTemplate = (name) => `import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '../../themed/ThemedView';
import { ThemedText } from '../../themed/ThemedText';
import { AppConfig } from '../../../config/AppConfig';

interface ${name}Props {
  // Add props here
}

export const ${name}: React.FC<${name}Props> = (props) => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText>${name}</ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    // Add styles here
  },
});
`;

const args = process.argv.slice(2);
const componentName = args[0];
const componentType = args[1] || 'ui'; // default to ui

if (!componentName) {
  console.error('Please provide a component name');
  process.exit(1);
}

const componentPath = path.join(__dirname, '..', 'src', 'components', componentType, `${componentName}.tsx`);

fs.writeFileSync(componentPath, componentTemplate(componentName));
console.log(`Created component at ${componentPath}`);
