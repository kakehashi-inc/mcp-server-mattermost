#!/bin/bash

# Load environment variables from .env
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test function
run_test() {
  local test_name="$1"
  local input="$2"
  local expected="$3"

  echo -n "Running test: $test_name... "

  # Run the command and capture output
  local output=$(echo "$input" | node --import tsx src/main.ts --stdio 2>&1)

  # Compare output with expected
  if echo "$output" | grep -q "$expected"; then
    echo -e "${GREEN}PASS${NC}"
    return 0
  else
    echo -e "${RED}FAIL${NC}"
    echo "Expected: $expected"
    echo "Got: $output"
    return 1
  fi
}

# Initialize test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test cases
echo "Starting stdio tests..."

# Test 1: Basic help command
run_test "Help command" \
  "help" \
  "Available commands:"
[ $? -eq 0 ] && ((TESTS_PASSED++)) || ((TESTS_FAILED++))

# Test 2: Invalid command
run_test "Invalid command" \
  "invalidcommand" \
  "Unknown command"
[ $? -eq 0 ] && ((TESTS_PASSED++)) || ((TESTS_FAILED++))

# Test 3: Empty input
run_test "Empty input" \
  "" \
  "Please enter a command"
[ $? -eq 0 ] && ((TESTS_PASSED++)) || ((TESTS_FAILED++))

# Print summary
echo
echo "Test Summary:"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

# Exit with failure if any test failed
[ $TESTS_FAILED -eq 0 ] || exit 1
