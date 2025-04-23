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

    private long totalPosts;
    private long postsCreatedToday;
}
