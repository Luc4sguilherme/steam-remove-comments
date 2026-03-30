import { Box, Text, useInput } from 'ink';
import React, { useState } from 'react';

const SelectInput = ({ items, onSelect }) => {
  const [index, setIndex] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    }

    if (key.downArrow) {
      setIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    }

    if (key.return) {
      onSelect(items[index]);
    }
  });

  return (
    <Box flexDirection="column">
      {items.map((item, i) => (
        <Box key={item.value}>
          <Text color={i === index ? 'cyan' : undefined} bold={i === index}>
            {i === index ? '❯ ' : '  '}
            {item.label}
          </Text>
        </Box>
      ))}
    </Box>
  );
};

export default SelectInput;
