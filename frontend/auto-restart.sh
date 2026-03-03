#!/bin/bash

# Auto-restart script for Fresh County Frontend
# This script checks if the frontend is serving the correct content
# and automatically restarts it if routing issues are detected

# Configuration
DOMAIN="https://freshcounty.com"
LOG_FILE="$HOME/frontend-monitor.log"
RESTART_COUNT_FILE="$HOME/frontend-restart-count"
MAX_RESTARTS_PER_HOUR=3

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to check restart count
check_restart_limit() {
    if [ -f "$RESTART_COUNT_FILE" ]; then
        # Get current hour and last restart hour
        current_hour=$(date '+%Y%m%d%H')
        last_restart_info=$(cat "$RESTART_COUNT_FILE")
        
        last_hour=$(echo "$last_restart_info" | cut -d: -f1)
        restart_count=$(echo "$last_restart_info" | cut -d: -f2)
        
        if [ "$current_hour" = "$last_hour" ]; then
            if [ "$restart_count" -ge "$MAX_RESTARTS_PER_HOUR" ]; then
                log_message "❌ Maximum restarts per hour reached ($restart_count/$MAX_RESTARTS_PER_HOUR)"
                return 1
            fi
            # Increment restart count for current hour
            echo "$current_hour:$((restart_count + 1))" > "$RESTART_COUNT_FILE"
        else
            # New hour, reset counter
            echo "$current_hour:1" > "$RESTART_COUNT_FILE"
        fi
    else
        # First restart
        current_hour=$(date '+%Y%m%d%H')
        echo "$current_hour:1" > "$RESTART_COUNT_FILE"
    fi
    return 0
}

# Function to test the frontend
test_frontend() {
    log_message "🔍 Testing frontend at $DOMAIN"
    
    # Get the homepage content
    response=$(curl -s -L --max-time 30 "$DOMAIN" 2>&1)
    curl_exit_code=$?
    
    if [ $curl_exit_code -ne 0 ]; then
        log_message "❌ Curl failed with exit code $curl_exit_code"
        return 1
    fi
    
    # Check if response contains admin-related content (indicates routing issue)
    if echo "$response" | grep -qi "admin\|dashboard\|management"; then
        log_message "❌ ROUTING ISSUE DETECTED: Frontend serving admin content"
        return 1
    fi
    
    # Check if response contains expected frontend content
    if echo "$response" | grep -qi "freshcounty\|fresh county"; then
        log_message "✅ Frontend test passed"
        return 0
    else
        log_message "❌ Frontend not serving expected content"
        return 1
    fi
}

# Function to restart frontend application
restart_frontend() {
    log_message "🔄 Attempting to restart frontend application..."
    
    # Method 1: Touch server.js to trigger Passenger restart
    touch "$HOME/public_html/frontend/server.js"
    if [ $? -eq 0 ]; then
        log_message "📝 Touched server.js file"
    fi
    
    # Method 2: Touch tmp/restart.txt (Passenger restart file)
    mkdir -p "$HOME/public_html/frontend/tmp"
    touch "$HOME/public_html/frontend/tmp/restart.txt"
    if [ $? -eq 0 ]; then
        log_message "📝 Created restart.txt file"
    fi
    
    # Wait for restart to take effect
    log_message "⏳ Waiting 30 seconds for restart to take effect..."
    sleep 30
    
    # Test again after restart
    if test_frontend; then
        log_message "✅ Frontend restart successful"
        return 0
    else
        log_message "❌ Frontend still has issues after restart"
        return 1
    fi
}

# Function to send notification (if notification system is available)
send_notification() {
    local message="$1"
    # You can add email notification here if needed
    # echo "$message" | mail -s "Fresh County Frontend Alert" admin@freshcounty.com
    log_message "📧 Notification: $message"
}

# Main execution
main() {
    log_message "🚀 Starting frontend health check"
    
    # Test the frontend
    if test_frontend; then
        log_message "✅ Frontend is healthy"
        exit 0
    else
        log_message "⚠️ Frontend health check failed"
        
        # Check if we can restart
        if check_restart_limit; then
            log_message "🔄 Attempting restart (within limits)"
            
            if restart_frontend; then
                send_notification "Frontend automatically restarted successfully"
                exit 0
            else
                send_notification "Frontend restart failed - manual intervention required"
                exit 1
            fi
        else
            send_notification "Frontend restart limit reached - manual intervention required"
            exit 1
        fi
    fi
}

# Run main function
main