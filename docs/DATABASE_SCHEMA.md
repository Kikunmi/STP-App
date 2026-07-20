# User

```js
{
  (_id, username, email, passwordHash, createdAt);
}

//Trip
{
  (_id, ownerId, title, destination, startDate, endDate, budget, status);
}

//Itinerary
{
  (_id,
    tripId,
    title,
    description,
    activityDate,
    time,
    location,
    estimatedCost);
}

//Expense
{
  (_id, tripId, title, amount, category, date);
}

//SharedTrip
{
  (_id, tripId, ownerId, sharedUserId);
}

//FavoriteDestination
{
  (_id, userId, destination);
}
```
