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
        saveIfNotExist(
                "merongcat",
                "merongcat",
                100,
                ":merongcat:",
                "/emojis/merongcat.png"
        );
        saveIfNotExist(
                "10-10",
                "10 out of 10",
                150,
                ":ten-ten:",
                "/emojis/10-outof-10.gif"
        );
        saveIfNotExist(
                "goodluck",
                "행운의 클로버",
                150,
                ":goodluck:",
                "/emojis/goodluck.gif"
        );
        saveIfNotExist(
                "god",
                "3대 500 개",
                100,
                ":god:",
                "/emojis/god.png"
        );
        saveIfNotExist(
                "현타",
                "정신 단디 잡으세요",
                100,
                ":feels:",
                "/emojis/feels.png"
        );
        saveIfNotExist(
                "cool dog",
                "나는 멋쟁이",
                200,
                ":cooldog:",
                "/emojis/cool-doge.gif"
        );
        saveIfNotExist(
                "박수",
                "응원의 박수",
                100,
                ":clap:",
                "/emojis/clapping.gif"
        );
        saveIfNotExist(
                "비상등",
                "조심하세요",
                150,
                ":alert:",
                "/emojis/alert.gif"
        );
        saveIfNotExist(
                "뽀뽀냥이",
                "쪽!",
                200,
                ":bbobbocat:",
                "/emojis/bbobbocat.jpg"
        );
        saveIfNotExist(
                "맑눈광",
                "맑은 눈의 광인",
                150,
                ":malknun:",
                "/emojis/malknunguang.jpg"
        );
        saveIfNotExist(
                "sob",
                "광광",
                150,
                ":sob:",
                "/emojis/sob.png"
        );
        saveIfNotExist(
                "congrats",
                "심심한 축하의 말씀",
                100,
                ":congrats:",
                "/emojis/tada.png"
        );
        saveIfNotExist(
                "로켓",
                "발사!",
                100,
                ":rocket:",
                "/emojis/rocket.png"
        );
        saveIfNotExist(
                "two hearts",
                "하트x2",
                100,
                ":twohearts:",
                "/emojis/two-hearts.gif"
        );
        saveIfNotExist(
                "spinnin' heart",
                "빙빙 하트",
                100,
                ":revolvinghearts:",
                "/emojis/revolving-hearts.gif"
        );
        saveIfNotExist(
                "cupid heart",
                "큐피드 하트",
                100,
                ":heartwarrow:",
                "/emojis/heart-with-arrow.gif"
        );
        saveIfNotExist(
                "불타는 하트",
                "할수있다!!!!",
                100,
                ":heartonfire:",
                "/emojis/heart-on-fire.gif"
        );
        saveIfNotExist(
                "heart beam",
                "커지는 하트",
                100,
                ":growingheart:",
                "/emojis/growing-heart.gif"
        );
        saveIfNotExist(
                "heart!",
                "하트!",
                100,
                ":heart!:",
                "/emojis/heart-exclamation.gif"
        );
        saveIfNotExist(
                "따봉",
                "thumbs-up",
                50,
                ":ddabong:",
                "/emojis/ddabong.gif"
        );
        saveIfNotExist(
                "detoxing",
                "디톡스 모두모두 화이팅!",
                100,
                ":detox:",
                "/emojis/detoxing.gif"
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
