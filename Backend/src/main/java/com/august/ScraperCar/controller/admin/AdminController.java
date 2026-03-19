package com.august.ScraperCar.controller.admin;

import com.august.ScraperCar.dto.admin.AdminAlertDTO;
import com.august.ScraperCar.dto.admin.AdminJobDTO;
import com.august.ScraperCar.dto.admin.AdminUserDTO;
import com.august.ScraperCar.model.*;
import com.august.ScraperCar.service.admin.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users/all")
    public List<AdminUserDTO> getAllUser() {
        return adminService.listarUsuarios();
    }

    @DeleteMapping("/alert/{userAlertID}")
    public ResponseEntity<?> deleteAlert(@PathVariable Long userAlertID){
        return adminService.excluirUserAlert(userAlertID);
    }

    @GetMapping("/alert/all")
    public List<AdminAlertDTO> getAllAlerts(){
        return adminService.listarAlertasAll();
    }

    @GetMapping("/job/all")
    public List<AdminJobDTO> listarJobs() {
        return adminService.listarJobs();
    }


}
