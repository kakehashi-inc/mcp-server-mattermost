#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default test values
DEFAULT_PORT=8201
DEFAULT_ENDPOINT="http://localhost:8065"
DEFAULT_TOKEN="test-token"
DEFAULT_TEAM_ID="test-team"

# Create temporary .env for testing if not exists
create_test_env() {
  if [ ! -f .env ]; then
    echo "Creating temporary .env for testing..."
    cat > .env.test << EOF
MATTERMOST_ENDPOINT=$DEFAULT_ENDPOINT
MATTERMOST_TOKEN=$DEFAULT_TOKEN
MATTERMOST_TEAM_ID=$DEFAULT_TEAM_ID
MATTERMOST_PORT=$DEFAULT_PORT
EOF
  fi
}

# Cleanup function
cleanup() {
  echo "Cleaning up..."
  if [ ! -z "$SERVER_PID" ]; then
    echo "Stopping server..."
    kill $SERVER_PID 2>/dev/null || true
  fi
  if [ -f .env.test ]; then
    rm .env.test
  fi
}

# Set up trap for cleanup
trap cleanup EXIT

# Test function for HTTP endpoints
test_endpoint() {
  local test_name="$1"
  local method="$2"
  local endpoint="$3"
  local expected_status="$4"
  local data="$5"
  local max_retries=5
  local retry_count=0

  echo -n "Testing $test_name... "

  while [ $retry_count -lt $max_retries ]; do
    # Prepare curl command
    local curl_cmd="curl -s -w '%{http_code}' -X $method http://localhost:$DEFAULT_PORT$endpoint"
    if [ ! -z "$data" ]; then
      curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
    fi

    # Execute request and capture response
    local response=$(eval $curl_cmd)
    local status_code=${response: -3}
    local body=${response:0:${#response}-3}

    # Check status code
    if [ "$status_code" = "$expected_status" ]; then
      echo -e "${GREEN}PASS${NC}"
      return 0
    elif [ $retry_count -lt $((max_retries-1)) ]; then
      echo -n "."
      sleep 1
      ((retry_count++))
    else
      echo -e "${RED}FAIL${NC}"
      echo "Expected status: $expected_status"
      echo "Got status: $status_code"
      echo "Response body: $body"
      return 1
    fi
  done
}

# Initialize test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Create test environment
create_test_env

# Start server in background
echo "Starting server..."
MATTERMOST_PORT=$DEFAULT_PORT \
MATTERMOST_ENDPOINT=$DEFAULT_ENDPOINT \
MATTERMOST_TOKEN=$DEFAULT_TOKEN \
MATTERMOST_TEAM_ID=$DEFAULT_TEAM_ID \
./start-http.sh &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 2

# Test cases
echo "Starting HTTP tests..."

# Test 1: Health check endpoint
test_endpoint "Health check" "GET" "/health" "200"
[ $? -eq 0 ] && ((TESTS_PASSED++)) || ((TESTS_FAILED++))

# Test 2: Invalid endpoint
test_endpoint "Invalid endpoint" "GET" "/invalid" "404"
[ $? -eq 0 ] && ((TESTS_PASSED++)) || ((TESTS_FAILED++))

# Test 3: Command endpoint without data
test_endpoint "Command without data" "POST" "/command" "400"
[ $? -eq 0 ] && ((TESTS_PASSED++)) || ((TESTS_FAILED++))

# Test 4: Command endpoint with data
test_endpoint "Command with data" "POST" "/command" "200" '{"command": "help"}'
[ $? -eq 0 ] && ((TESTS_PASSED++)) || ((TESTS_FAILED++))

# Print summary
echo
echo "Test Summary:"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

# Exit with failure if any test failed
[ $TESTS_FAILED -eq 0 ] || exit 1
