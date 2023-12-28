# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2023-12-28
### Added
- Column for timestamp
- Dialog for creating new drinks or editing existing ones. (This is the biggest change, this dialog also supports
mixed drinks that have multiple ingredients and calculates the total amount of alcohol automatically)
- Buttons for duplicating or removing an entry from the list
- Directory for resources, and 1 helper class Drink.js in it

### Changed
- When a validation error occurs, an alert is sent indicating what needs to be fixed
- Moved index.html, style.css & index.js to root of repo
- Renamed style.css to index.css

### Removed
- Column for drink count
- Column for drink volume
- Column for drink alcohol percentage
- Github Pages Action (nowadays you can just host from the root of the repo on Pages automatically)

## [1.2.0] - 2022-12-25
### Added
- Link to this changelog (https://github.com/Gimanua/alko-logg/blob/main/CHANGELOG.md) on the version text.
- Support for local storage, automatically saves and loads the list of drinks to and from the local storage.
- Editing the count to 0 of a drinks removes it from the list.
- Button for clearing the whole list of drinks

### Changed
- 0 is now a valid value for volume and alchol content

## [1.1.0] - 2022-10-14
### Added
- Ability to click on table cells to edit the values and recalculate the total shots value.

## [1.0.0] - 2022-08-04
### Added
- Shots count at top of page.
- Table that shows all drinks the user have added. Every drink has a count, name, volume, alcohol content and shots cell.
- Section for adding new drinks to the table.
- Version tracker at bottom right corner of page.
