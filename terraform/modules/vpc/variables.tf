variable "name" {
  type        = string
  description = "Resources name"
}

variable "tags" {
  type        = map(string)
  description = "Tags for resoruces"
  default     = null
}
