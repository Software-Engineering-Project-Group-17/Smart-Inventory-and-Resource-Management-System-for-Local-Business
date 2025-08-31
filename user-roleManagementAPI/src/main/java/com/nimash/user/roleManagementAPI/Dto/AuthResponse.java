package com.nimash.user.roleManagementAPI.Dto;

public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private long expiresIn;
    private UserProfileResponse user;
    private String uid;

    public AuthResponse() {}

    public AuthResponse(String accessToken, String refreshToken, String tokenType, long expiresIn, String uid) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = tokenType;
        this.expiresIn = expiresIn;
        this.uid = uid;
    }

    public AuthResponse(String accessToken, String refreshToken, String tokenType, long expiresIn, UserProfileResponse user, String uid) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = tokenType;
        this.expiresIn = expiresIn;
        this.user = user;
        this.uid = uid;
    }

    // Getters
    public String getAccessToken() { return accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public String getTokenType() { return tokenType; }
    public long getExpiresIn() { return expiresIn; }
    public UserProfileResponse getUser() { return user; }
    public String getUid() { return uid; }
    
    // Setters
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }
    public void setUser(UserProfileResponse user) { this.user = user; }
    public void setUid(String uid) { this.uid = uid; }
}