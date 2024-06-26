-- MySQL Script generated by MySQL Workbench
-- Tue Jun 11 14:38:17 2024
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema dizziness_syst
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema dizziness_syst
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `dizziness_syst` DEFAULT CHARACTER SET utf8 ;
USE `dizziness_syst` ;

-- -----------------------------------------------------
-- Table `dizziness_syst`.`Profesional`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dizziness_syst`.`Profesional` (
  `PK_Profesional` INT NOT NULL AUTO_INCREMENT,
  `tipoMatricula` VARCHAR(45) NOT NULL,
  `matricula` INT NOT NULL,
  `validar` INT NOT NULL,
  PRIMARY KEY (`PK_Profesional`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dizziness_syst`.`Paciente`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dizziness_syst`.`Paciente` (
  `PK_Paciente` INT NOT NULL AUTO_INCREMENT,
  `tipoDoc` VARCHAR(22) NOT NULL,
  `documento` INT NOT NULL,
  `fechaNacimiento` DATE NOT NULL,
  `FK_Profesional` INT NOT NULL,
  PRIMARY KEY (`PK_Paciente`),
  INDEX `fk_Paciente_Profesional1_idx` (`FK_Profesional` ASC),
  CONSTRAINT `fk_Paciente_Profesional1`
    FOREIGN KEY (`FK_Profesional`)
    REFERENCES `dizziness_syst`.`Profesional` (`PK_Profesional`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dizziness_syst`.`Rol`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dizziness_syst`.`Rol` (
  `PK_Rol` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`PK_Rol`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dizziness_syst`.`Administrador`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dizziness_syst`.`Administrador` (
  `PK_Administrador` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`PK_Administrador`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dizziness_syst`.`Usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dizziness_syst`.`Usuario` (
  `PK_Usuario` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `apellido` VARCHAR(45) NOT NULL,
  `email` VARCHAR(45) NOT NULL,
  `pass` VARCHAR(60) NOT NULL,
  `FK_Rol` INT NOT NULL,
  `FK_Paciente` INT NULL,
  `FK_Profesional` INT NULL,
  `FK_Administrador` INT NULL,
  PRIMARY KEY (`PK_Usuario`),
  INDEX `fk_Usuario_Rol1_idx` (`FK_Rol` ASC),
  INDEX `fk_Usuario_Paciente1_idx` (`FK_Paciente` ASC),
  INDEX `fk_Usuario_Profesional1_idx` (`FK_Profesional` ASC),
  INDEX `fk_Usuario_Administrador1_idx` (`FK_Administrador` ASC),
  CONSTRAINT `fk_Usuario_Rol1`
    FOREIGN KEY (`FK_Rol`)
    REFERENCES `dizziness_syst`.`Rol` (`PK_Rol`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Usuario_Paciente1`
    FOREIGN KEY (`FK_Paciente`)
    REFERENCES `dizziness_syst`.`Paciente` (`PK_Paciente`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Usuario_Profesional1`
    FOREIGN KEY (`FK_Profesional`)
    REFERENCES `dizziness_syst`.`Profesional` (`PK_Profesional`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Usuario_Administrador1`
    FOREIGN KEY (`FK_Administrador`)
    REFERENCES `dizziness_syst`.`Administrador` (`PK_Administrador`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dizziness_syst`.`Crisis`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dizziness_syst`.`Crisis` (
  `PK_Crisis` INT NOT NULL AUTO_INCREMENT,
  `brusco` TINYINT NOT NULL,
  `lento` TINYINT NOT NULL,
  `inicio` VARCHAR(200) NOT NULL,
  `duracion` VARCHAR(45) NOT NULL,
  `frecuencia` VARCHAR(200) NOT NULL,
  `factoresDesenc` VARCHAR(200) NOT NULL,
  PRIMARY KEY (`PK_Crisis`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dizziness_syst`.`Estudio`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dizziness_syst`.`Estudio` (
  `PK_Estudio` INT NOT NULL AUTO_INCREMENT,
  `otoscopia` VARCHAR(200) NULL,
  `audiologico` VARCHAR(200) NULL,
  `videonistamografia` VARCHAR(200) NULL,
  `tac` VARCHAR(200) NULL,
  `otro` VARCHAR(200) NULL,
  PRIMARY KEY (`PK_Estudio`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dizziness_syst`.`Ingreso`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dizziness_syst`.`Ingreso` (
  `PK_Ingreso` INT NOT NULL AUTO_INCREMENT,
  `fecha` DATE NOT NULL,
  `edad` INT NOT NULL,
  `profesion` VARCHAR(45) NOT NULL,
  `telefono` INT NOT NULL,
  `derivacion` VARCHAR(45) NOT NULL,
  `motivoConsulta` VARCHAR(200) NOT NULL,
  `diagnostico` VARCHAR(100) NOT NULL,
  `FK_Paciente` INT NOT NULL,
  `FK_Crisis` INT NOT NULL,
  `FK_Estudio` INT NOT NULL,
  PRIMARY KEY (`PK_Ingreso`),
  INDEX `fk_Ingreso_Paciente1_idx` (`FK_Paciente` ASC),
  INDEX `fk_Ingreso_Crisis1_idx` (`FK_Crisis` ASC),
  INDEX `fk_Ingreso_Estudio1_idx` (`FK_Estudio` ASC),
  CONSTRAINT `fk_Ingreso_Paciente1`
    FOREIGN KEY (`FK_Paciente`)
    REFERENCES `dizziness_syst`.`Paciente` (`PK_Paciente`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Ingreso_Crisis1`
    FOREIGN KEY (`FK_Crisis`)
    REFERENCES `dizziness_syst`.`Crisis` (`PK_Crisis`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Ingreso_Estudio1`
    FOREIGN KEY (`FK_Estudio`)
    REFERENCES `dizziness_syst`.`Estudio` (`PK_Estudio`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dizziness_syst`.`Sintoma`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dizziness_syst`.`Sintoma` (
  `PK_Sintoma` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`PK_Sintoma`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dizziness_syst`.`Ingreso_has_Sintoma`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dizziness_syst`.`Ingreso_has_Sintoma` (
  `FK_Ingreso` INT NOT NULL,
  `FK_Sintoma` INT NOT NULL,
  PRIMARY KEY (`FK_Ingreso`, `FK_Sintoma`),
  INDEX `fk_Ingreso_has_Sintoma_Sintoma1_idx` (`FK_Sintoma` ASC),
  INDEX `fk_Ingreso_has_Sintoma_Ingreso1_idx` (`FK_Ingreso` ASC),
  CONSTRAINT `fk_Ingreso_has_Sintoma_Ingreso1`
    FOREIGN KEY (`FK_Ingreso`)
    REFERENCES `dizziness_syst`.`Ingreso` (`PK_Ingreso`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Ingreso_has_Sintoma_Sintoma1`
    FOREIGN KEY (`FK_Sintoma`)
    REFERENCES `dizziness_syst`.`Sintoma` (`PK_Sintoma`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dizziness_syst`.`Sesion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dizziness_syst`.`Sesion` (
  `PK_Sesion` INT NOT NULL AUTO_INCREMENT,
  `nroSesion` INT NOT NULL,
  `fechaActivacion` DATE NOT NULL,
  `repeticiones` INT NOT NULL,
  `fechaRealizacion` DATE NULL,
  `FK_Paciente` INT NOT NULL,
  PRIMARY KEY (`PK_Sesion`),
  INDEX `fk_Sesion_Paciente1_idx` (`FK_Paciente` ASC),
  CONSTRAINT `fk_Sesion_Paciente1`
    FOREIGN KEY (`FK_Paciente`)
    REFERENCES `dizziness_syst`.`Paciente` (`PK_Paciente`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dizziness_syst`.`Ejercicio`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dizziness_syst`.`Ejercicio` (
  `PK_Ejercicio` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `descripcion` VARCHAR(100) NOT NULL,
  `video` VARCHAR(100) NOT NULL,
  `FK_Profesional` INT NOT NULL,
  PRIMARY KEY (`PK_Ejercicio`),
  INDEX `fk_Ejercicio_Profesional1_idx` (`FK_Profesional` ASC),
  CONSTRAINT `fk_Ejercicio_Profesional1`
    FOREIGN KEY (`FK_Profesional`)
    REFERENCES `dizziness_syst`.`Profesional` (`PK_Profesional`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dizziness_syst`.`Asignacion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dizziness_syst`.`Asignacion` (
  `PK_Asignacion` INT NOT NULL AUTO_INCREMENT,
  `repeticiones` INT NOT NULL,
  `FK_Sesion` INT NOT NULL,
  `FK_Ejercicio` INT NOT NULL,
  PRIMARY KEY (`PK_Asignacion`),
  INDEX `fk_Actividad_Sesion1_idx` (`FK_Sesion` ASC),
  INDEX `fk_Asignacion_Ejercicio1_idx` (`FK_Ejercicio` ASC),
  CONSTRAINT `fk_Actividad_Sesion1`
    FOREIGN KEY (`FK_Sesion`)
    REFERENCES `dizziness_syst`.`Sesion` (`PK_Sesion`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Asignacion_Ejercicio1`
    FOREIGN KEY (`FK_Ejercicio`)
    REFERENCES `dizziness_syst`.`Ejercicio` (`PK_Ejercicio`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dizziness_syst`.`Evolucion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dizziness_syst`.`Evolucion` (
  `PK_Evolucion` INT NOT NULL AUTO_INCREMENT,
  `fecha` DATE NOT NULL,
  `evolucion` VARCHAR(200) NOT NULL,
  `FK_Paciente` INT NOT NULL,
  PRIMARY KEY (`PK_Evolucion`),
  INDEX `fk_Evolucion_Paciente1_idx` (`FK_Paciente` ASC),
  CONSTRAINT `fk_Evolucion_Paciente1`
    FOREIGN KEY (`FK_Paciente`)
    REFERENCES `dizziness_syst`.`Paciente` (`PK_Paciente`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dizziness_syst`.`Seguimiento`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dizziness_syst`.`Seguimiento` (
  `PK_Seguimiento` INT NOT NULL AUTO_INCREMENT,
  `fecha` DATE NOT NULL,
  `comodidad` INT NOT NULL,
  `claridad` INT NOT NULL,
  `dificultad` VARCHAR(200) NULL,
  `malestar` VARCHAR(200) NULL,
  `mejoria` INT NOT NULL,
  `otros` VARCHAR(200) NULL,
  `FK_Sesion` INT NOT NULL,
  PRIMARY KEY (`PK_Seguimiento`, `FK_Sesion`),
  INDEX `fk_Seguimiento_Sesion1_idx` (`FK_Sesion` ASC),
  CONSTRAINT `fk_Seguimiento_Sesion1`
    FOREIGN KEY (`FK_Sesion`)
    REFERENCES `dizziness_syst`.`Sesion` (`PK_Sesion`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
