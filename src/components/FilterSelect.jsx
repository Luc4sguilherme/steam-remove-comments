import { Box, Text } from 'ink';
import React from 'react';

import SelectInput from './SelectInput.jsx';

const FILTER_ITEMS = [
  { label: 'Only comments made by others', value: 'others' },
  { label: 'Only comments made by me', value: 'mine' },
  { label: 'All comments', value: 'all' },
];

const FilterSelect = ({ onSelect }) => (
  <Box flexDirection="column">
    <Text bold>Which comments would you like to remove from your profile?</Text>
    <SelectInput items={FILTER_ITEMS} onSelect={onSelect} />
  </Box>
);

export default FilterSelect;
