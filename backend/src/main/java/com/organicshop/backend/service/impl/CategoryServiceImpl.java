package com.organicshop.backend.service.impl;

import com.organicshop.backend.dto.CategoryDTO;
import com.organicshop.backend.entity.Category;
import com.organicshop.backend.exception.ResourceNotFoundException;
import com.organicshop.backend.mapper.CategoryMapper;
import com.organicshop.backend.repository.CategoryRepository;
import com.organicshop.backend.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    CategoryRepository categoryRepository;

    @Autowired
    CategoryMapper categoryMapper;

    @Override
    @Cacheable(value = "categories")
    public List<CategoryDTO> getAllCategories() {
        return categoryMapper.toDtoList(categoryRepository.findAll());
    }

    @Override
    @Cacheable(value = "category", key = "#id")
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return categoryMapper.toDto(category);
    }

    @Override
    @CacheEvict(value = {"categories", "category"}, allEntries = true)
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        Category category = categoryMapper.toEntity(categoryDTO);
        return categoryMapper.toDto(categoryRepository.save(category));
    }

    @Override
    @CacheEvict(value = {"categories", "category"}, allEntries = true)
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        
        return categoryMapper.toDto(categoryRepository.save(category));
    }

    @Override
    @CacheEvict(value = {"categories", "category"}, allEntries = true)
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        categoryRepository.delete(category);
    }
}
