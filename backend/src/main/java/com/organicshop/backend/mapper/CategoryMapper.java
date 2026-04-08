package com.organicshop.backend.mapper;

import com.organicshop.backend.dto.CategoryDTO;
import com.organicshop.backend.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryMapper INSTANCE = Mappers.getMapper(CategoryMapper.class);

    CategoryDTO toDto(Category category);
    Category toEntity(CategoryDTO categoryDTO);
    List<CategoryDTO> toDtoList(List<Category> categories);
}
