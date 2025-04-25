package com.dd.blog.global.init;

import com.dd.blog.domain.point.pointstore.entity.PointItem;
import com.dd.blog.domain.point.pointstore.repository.PointItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PointItemInitializer implements CommandLineRunner {

    private final PointItemRepository pointItemRepository;

    @Override
    public void run(String... args) {
        saveIfNotExist("기본 이모티콘", "기본 이모티콘입니다.", 100, "https://example.com/item1.png");
        saveIfNotExist("고급 이모티콘", "고급진 이모티콘입니다.", 300, "https://example.com/item2.png");
    }

    private void saveIfNotExist(String name, String desc, int price, String imageUrl) {
        if (pointItemRepository.findByName(name).isEmpty()) {
            pointItemRepository.save(PointItem.builder()
                    .name(name)
                    .description(desc)
                    .price(price)
                    .imageUrl(imageUrl)
                    .build());
        }
    }
}
