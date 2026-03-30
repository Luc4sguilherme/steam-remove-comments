import { Box, Text } from 'ink';
import React from 'react';

import SelectInput from './SelectInput.jsx';

const MODE_ITEMS = [
  {
    label: 'Remove the comments you made on other profiles',
    value: 1,
  },
  {
    label: 'Remove the comments made on your profile',
    value: 2,
  },
];

const ModeSelect = ({ onSelect }) => (
  <Box flexDirection="column">
    <Text bold>Which comments would you like to remove?</Text>
    <SelectInput items={MODE_ITEMS} onSelect={onSelect} />
  </Box>
);

export default ModeSelect;
