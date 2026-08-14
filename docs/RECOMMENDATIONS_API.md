## Recommendations API

### `GET /api/v1/recommendations/properties`

- **Auth**: Required (tenant role)
- **Description**: Returns a ranked list of recommended properties for the current tenant. The engine is rules-based today (location, price fit, basic property quality, demand, and tenant risk signals) and is designed to be upgraded with ML models later.

#### Query Parameters

- `city` (optional, string): Filter properties by city.
- `district` (optional, string): Filter properties by district.
- `area` (optional, string): Filter properties by specific area/neighbourhood.
- `propertyType` (optional, enum): One of the `PropertyType` values (`APARTMENT`, `HOUSE`, etc.).
- `minRent` (optional, number): Minimum monthly rent.
- `maxRent` (optional, number): Maximum monthly rent.
- `limit` (optional, number): Maximum number of recommendations to return. Defaults to 20.

#### Response

Returns an array of `Property` objects (same shape as other property APIs), ordered from most to least recommended.

#### How scoring works (Phase 1 – rules-based)

- **Location match**: Boost if property city/district/area matches tenant `preferredLocations`.
- **Price suitability**: Boost if property rent is close to the tenant’s preferred rent band (if configured).
- **Property quality**: Bedrooms, bathrooms, and number of amenities increase score (with caps).
- **Demand/competition**: More pending applications slightly reduce a property’s score.
- **Tenant risk adjustment**: If the tenant already has fraud signals, overall recommendation scores are slightly reduced.

This scoring logic lives in `RecommendationService` and is intentionally isolated so it can later call ML models instead of (or in addition to) the rules.

