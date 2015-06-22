# MobileAndroidBackend
Mobile android backend

## Heroku server
https://mobileandroidbackend.herokuapp.com/test/index.html

## API
- [Fence group](#fenceGroup)
    - [Creating a fence group](#createFenceGroup)
    - [Reading a fence group](#readFenceGroup)
    - [Updating a fence group](#updateFenceGroup)
    - [Deleting a fence group](#deleteFenceGroup)
    - [Get all fence groups](#readAllFenceGroups)
    - [Get all fences for a fence group](#readFenceGroupComplete)
- [Fence](#fence)
    - [Creating a fence](#createFence)
    - [Reading a fence](#readFence)
    - [Updating a fence](#updatFence)
    - [Deleting a fence](#deleteFence)


## <a name="fenceGroup"></a>Fence group
#### <a name="createFenceGroup"></a>Creating a fence group

```
POST /fence_group

Required:
name
type

Returns: 
fence_group_id
name
type
```

#### <a name="readFenceGroup"></a>Reading a fence group

```
GET /fence_group/:fence_group_id

Returns: 
fence_group_id
name
type
```

#### <a name="updateFenceGroup"></a>Updating a fence group

```
PUT /fence_group/:fence_group_id

Required:
name
type

Returns: 
fence_group_id
name
type
```

#### <a name="deleteFenceGroup"></a>Deleting a fence group

```
DELETE /fence_group/:fence_group_id
```


#### <a name="readAllFenceGroups"></a>Get all fence groups

```
GET /fence_group/getAll

Returns array of:
fence_group_id
name
type
```


#### <a name="readFenceGroupComplete"></a>Get all fences for a fence group 

```
GET /fence_group/:fence_group_id/getFences

Returns array of:
fence_id
fence_group_id
lat
lng
radius
```

















## <a name="fence"></a>Fence
#### <a name="createFence"></a>Creating a fence

```
POST /fence_group/:fence_id/fence

Required:
lat
lng
radius

Returns: 
fence_id
fence_group_id
lat
lng
radius
```

#### <a name="readFence"></a>Reading a fence

```
GET /fence_group/:fence_group_id/fence/:fence_id

Returns: 
fence_id
fence_group_id
lat
lng
radius
```

#### <a name="updateFence"></a>Updating a fence

```
PUT /fence_group/:fence_group_id/fence/:fence_id

Required:
lat
lng
radius

Returns: 
fence_id
fence_group_id
lat
lng
radius
```

#### <a name="deleteFence"></a>Deleting a fence

```
DELETE /fence_group/:fence_group_id/fence/:fence_id
```