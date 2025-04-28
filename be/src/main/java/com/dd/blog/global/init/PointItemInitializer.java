package com.dd.blog.global.init;

import com.dd.blog.domain.point.pointstore.entity.PointItem;
import com.dd.blog.domain.point.pointstore.repository.PointItemRepository;
import com.dd.blog.global.aws.AwsS3Uploader;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PointItemInitializer implements CommandLineRunner {

    private final PointItemRepository pointItemRepository;

    @Override
    public void run(String... args) {
        saveIfNotExist(
                "brain",
                "brain",
                200,
                ":brain:",
                "/emojis/brain.gif"
        );
        saveIfNotExist(
                "리듬 타는 커비",
                "리듬 타는 커비입니다.",
                200,
                ":kirbyjam:",  // 이모티콘 코드
                "/emojis/kirby_jam.gif"  // 이미지 상대경로(추후 s3 절대경로로 수정)
        );
        saveIfNotExist(
                "huhcat",
                "huh?",
                300,
                ":huhcat:",   // 이모티콘 코드
                "/emojis/huh.gif"
        );
        saveIfNotExist(
                "zeus",
                "식빵 굽는 제우스",
                50,
                ":zeus:",   // 재현님이랑 같은 거!
                "/emojis/zeus.png"
        );
        saveIfNotExist(
                "mild-panic-intensified",
                "당황;;",
                100,
                ":panic:",
                "/emojis/mild-panic-intensifies.gif"
        );
        saveIfNotExist(
                "catjam",
                "catjam",
                200,
                ":catjam:",
                "/emojis/catjam.gif"
        );
        saveIfNotExist(
                "crycat",
                "crycat",
                100,
                ":crycat:",
                "/emojis/crycat.png"
        );
        saveIfNotExist(
                "facepalm",
                "facepalm",
                200,
                ":facepalm:",
                "/emojis/facepalm.gif"
        );
        saveIfNotExist(
                "whew",
                "whew",
                200,
                ":whew:",
                "/emojis/whew.gif"
        );
        saveIfNotExist(
                "headbang",
                "headbang",
                200,
                ":headbang:",
                "/emojis/headbang.gif"
        );
    }

    private void saveIfNotExist(String name, String desc, int price, String code, String imageUrl) {
        if (pointItemRepository.findByName(name).isEmpty()) {
            String fullImageUrl = getFullImageUrl(imageUrl);

            pointItemRepository.save(PointItem.builder()
                    .name(name)
                    .description(desc)
                    .price(price)
                    .imageUrl(fullImageUrl)
                    .code(code)
                    .build());
        }
    }

    private String getFullImageUrl(String imageUrl) {
        if (imageUrl.startsWith("/emojis/")) {
            return "https://braincleaner-images.s3.ap-northeast-2.amazonaws.com" + imageUrl;
        }
        return imageUrl; // 다른 경우(이미 절대경로)에는 그냥 반환
    }
}
