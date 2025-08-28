const router = require('express').Router()
const Course = require('../models').courseModel
const courseValidation = require('../validation').courseValidation

router.use((req, res, next) => {
  console.log("A request is coming into api…");
  next()
})

// 取得所有課程
router.get('/', (req, res) => {
  Course.find({})
    .populate("instructor", ["username", "email"])
    .then((course) => {
      res.send(course)
    })
    .catch(() => {
      res.status(500).send("Error!! Cannot get course!!")
    })
})

// 根據講師id找課程
router.get('/instructor/:_instructor_id', (req, res) => {
  let { _instructor_id } = req.params
  Course.find({ instructor: _instructor_id })
    .populate("_instructor", ["username", "email"])
    .then(data => {
      res.send(data)
    })
    .catch(() => {
      res.status(500).send("Cannot get course data.")
    })
})

// 根據學生id找已註冊課程
router.get('/student/:_student_id', (req, res) => {
  let { _student_id } = req.params
  Course.find({ student: _student_id })
    .populate("instructor", ["username", "email"])
    .then(data => {
      res.status(200).send(data)
    })
    .catch(() => {
      res.status(500).send("Cannot get data.")
    })
})

// 學生根據課程名稱搜尋課程
router.get('/findByName/:name', (req, res) => {
  let { name } = req.params
  Course.find({ title: name })
    .populate("instructor", ["username", "email"])
    .then(data => {
      res.status(200).send(data)
    })
    .catch(() => {
      res.status(500).send(err)
    })
})

// 學生註冊課程
router.post('/enroll/:_id', async (req, res) => {
  let { _id } = req.params
  let { user_id } = req.body
  try {
    let course = await Course.findOne({ _id })
    course.student.push(user_id)
    await course.save()
    res.send("Done Enrollment")
  }
  catch (err) { res.send(err) }
})

// 取得特定課程
router.get('/:_id', (req, res) => {
  let { _id } = req.params
  Course.findOne({ _id })
    .populate("instructor", ["email"])
    .then((course) => {
      res.send(course)
    })
    .catch((err) => {
      res.send(err)
    })
})

// 新增課程
router.post('/', async (req, res) => {
  // validate inputs before making a new course
  const { error } = courseValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  let { title, description, price } = req.body
  // 驗證身分
  if (req.user.isStudent()) { // usermodel 中的method
    return res.status(400).send("Only instructor can post a new course.")
  }

  // post new course
  let newCourse = new Course({
    title,
    description,
    price,
    instructor: req.user._id
  })
  try {
    await newCourse.save()
    res.status(200).send("New course has been saved.")
  } catch (err) {
    res.status(400).send("Cannot save the course.")
  }
})

// 部分修改課程
router.patch('/:_id', async (req, res) => {
  // validate inputs before making a new course
  const { error } = courseValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  let { _id } = req.params
  let course = await Course.findOne({ _id })

  if (!course) {
    res.status(404)
    return res.json({
      success: false,
      message: "Course not found"
    })
  }

  if (course.instructor.equals(req.user._id) || req.user.isAdmin) {
    Course.findOneAndUpdate({ _id }, req.body, { // 參數位置 : 要找的資料, 要更新的資料, optional 
      new: true,
      runValidators: true
    })
      .then((() => { res.send("Course updated.") }))
      .catch((err) => {
        res.json({
          success: false,
          message: err
        }
        )
      })
  } else {
    res.status(403)
    return res.json({
      success: false,
      message: "Only course instructor or web admin can update the course."
    })
  }
})

router.delete('/:_id', async (req, res) => {
  let { _id } = req.params
  let course = await Course.findOne({ _id })

  if (!course) {
    res.status(404)
    return res.json({
      success: false,
      message: "Course not found"
    })
  }

  if (course.instructor.equals(req.user._id) || req.user.isAdmin) {
    Course.deleteOne({ _id })
      .then((() => { res.send("Course deleted.") }))
      .catch((err) => {
        res.send({
          success: false,
          message: err
        })
      })
  } else {
    res.status(403)
    return res.json({
      success: false,
      message: "Only course instructor or web admin can delete the course."
    })
  }
})

module.exports = router