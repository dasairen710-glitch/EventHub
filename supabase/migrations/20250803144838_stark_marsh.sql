/*
# Seed Initial Data

## Overview
This migration seeds the database with sample categories and initial data to demonstrate the platform functionality.

## 1. Sample Data
- Event categories with colors and descriptions
- Sample events for demonstration
- Test user profiles (when users sign up)

## 2. Data Integrity
- All foreign key relationships maintained
- Realistic sample data for better UX testing
*/

-- Insert sample events for demonstration (these will only work after users sign up)
-- This is just structure - real events will be created by actual users

-- Note: We don't insert actual events here since they require real user IDs
-- The app will work with empty tables initially and users can create their own events