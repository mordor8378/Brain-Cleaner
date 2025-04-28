package com.dd.blog.domain.admin.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminDashboardStatsDto {

    private long totalUsers;
    private long usersJoinedToday;

    private long pendingVerifications;
    private long verificationsProcessedToday;

    private long pendingReports;
    private long reportsProcessedToday;

    @Builder
    public AdminDashboardStatsDto(long totalUsers, long usersJoinedToday, long pendingVerifications, long verificationsProcessedToday, long pendingReports, long reportsProcessedToday) {
        this.totalUsers = totalUsers;
        this.usersJoinedToday = usersJoinedToday;
        this.pendingVerifications = pendingVerifications;
        this.verificationsProcessedToday = verificationsProcessedToday;
        this.pendingReports = pendingReports;
        this.reportsProcessedToday = reportsProcessedToday;
    }
}
