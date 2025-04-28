package com.dd.blog.global.json;

import com.google.gson.Gson;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class StringArrayConverter implements AttributeConverter<String[], String> {
    private static final Gson gson = new Gson();

    @Override
    public String convertToDatabaseColumn(String[] attribute) {
        if (attribute == null) return null;
        return gson.toJson(attribute);
    }

    @Override
    public String[] convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) return new String[0];
        try {
            return gson.fromJson(dbData, String[].class);
        } catch (Exception e) {
            // 기존 방식으로 저장된 데이터를 위한 fallback 처리
            if (dbData.contains(",") && !dbData.contains("[")) {
                return dbData.split(",");
            }
            return new String[0];
        }
    }
}

