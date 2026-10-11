package com.campus.grievance.model;

public enum Category {
    HOSTEL("Hostel"),
    CLASSROOM_LAB("Classroom / Lab"),
    TRANSPORT("Transport"),
    ELECTRICITY_WATER("Electricity / Water"),
    CLEANLINESS("Cleanliness"),
    MAINTENANCE("Maintenance"),
    OTHER("Other");

    private final String displayName;

    Category(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
