package com.organicshop.backend.repository;

import com.organicshop.backend.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.organicshop.backend.entity.OrderStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {

    @Query("SELECT COUNT(od) FROM OrderDetail od JOIN od.order o WHERE o.user.id = :userId AND od.product.id = :productId AND o.orderStatus = :status")
    long countByUserIdAndProductIdAndOrderStatus(@Param("userId") Long userId, @Param("productId") Long productId, @Param("status") OrderStatus status);
}
