package com.faahlor.mapper;

import com.faahlor.dto.HslColorDto;
import com.faahlor.model.HslColor;
import org.springframework.stereotype.Component;

@Component
public class HslColorMapper {

    public HslColorDto toDto(HslColor color) {
        if (color == null) return null;
        return new HslColorDto(color.getHue(), color.getSaturation(), color.getBrightness());
    }

    public HslColor toModel(HslColorDto dto) {
        if (dto == null) return null;
        return new HslColor(dto.getHue(), dto.getSaturation(), dto.getBrightness());
    }
}
