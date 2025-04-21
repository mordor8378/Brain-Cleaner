package com.dd.blog.domain.admin.service;

import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.entity.UserRole;
import com.dd.blog.domain.user.user.entity.UserStatus;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class UserSpecifications {

    // 특정 닉네임 포함 (Like) 검색
    public static Specification<User> nicknameContains(String nickname) {
        return StringUtils.hasText(nickname) ?
                (root, query, criteriaBuilder) ->
                       criteriaBuilder.like(root.get("nickname"), "%" + nickname + "%")
                      : Specification.where(null);

    }

    // 특정 이메일 일치(Equal) 검색
    public static Specification<User> emailContains(String email) {
        return StringUtils.hasText(email) ?
                (root, query, criteriaBuilder) ->
                criteriaBuilder.like(root.get("email"), "%" + email + "%")
                      : Specification.where(null);
    }

    // 역할 (Role) 일치 (Equal) 필터 검색
    public static Specification<User> roleEquals(UserRole role) {
        return role != null ?
                (root, query, criteriaBuilder) ->
                        criteriaBuilder.equal(root.get("role"), role)
                        : Specification.where(null);
    }



    // 상태 (Status) 일치 (Equal) 필터 검색
    public static Specification<User> statusEquals(UserStatus status) {
        return status != null ?
                (root, query, criteriaBuilder) ->
                        criteriaBuilder.equal(root.get("status"), status)
                : Specification.where(null);
    }
}
